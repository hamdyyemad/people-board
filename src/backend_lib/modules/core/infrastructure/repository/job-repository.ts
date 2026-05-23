// ORM (Drizzle) repository implementation for Job aggregate
import { eq, isNull, and, count, ilike } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { DrizzleClient } from '../../../../shared/infrastructure/databases/drizzle-client';
import { JobsTable } from '../databases/tables/jobs-table';
import { departmentsTable } from '../databases/tables/departments-table';

// Base repository
import { BaseRepository } from './base-repository';

// Domain
import { IJobRepository, JobWithDepartmentName } from '../../domain/ports/repositories/job-repository';
import { Job } from '../../domain/entities/job';
import { JobTitle } from '../../domain/value-objects/job';
import { DepartmentName } from '../../domain/value-objects/department';

// DTOs
import type { ListingQueryInput } from '../../../../shared/listing';

export class JobRepository extends BaseRepository<Job> implements IJobRepository {
  protected table = JobsTable;
  private readonly departmentAlias = alias(departmentsTable, 'department');

  /**
   * Resolves custom column mappings for query building.
   * Maps 'departmentName' to the aliased department table's name column.
   * Used by base repository's buildListQuery for sorting and cursor operations.
   * 
   * @param field - The field name to resolve
   * @returns The Drizzle column reference or calls super for standard fields
   */
  protected resolveColumn(field: string): any {
    if (field === 'departmentName') return this.departmentAlias.name;
    return super.resolveColumn(field);
  }

  /**
   * Find job by ID with department name
   * Overrides base implementation to include LEFT JOIN for departmentName and use projection
   * 
   * @param id - The job ID to search for
   * @param isAudit - If true, includes soft-deleted jobs (audit mode). Default: false
   */
  async findById(id: string, isAudit: boolean = false): Promise<JobWithDepartmentName | null> {
    const projection = {
      id: JobsTable.id,
      title: JobsTable.title,
      departmentId: JobsTable.departmentId,
      departmentName: this.departmentAlias.name,
      createdAt: JobsTable.createdAt,
      updatedAt: JobsTable.updatedAt,
      deletedAt: JobsTable.deletedAt,
    };

    const whereCondition = !isAudit
      ? and(
          eq(JobsTable.id, id),
          isNull(JobsTable.deletedAt)
        )
      : eq(JobsTable.id, id);

    const result = await DrizzleClient
      .select(projection)
      .from(JobsTable)
      .leftJoin(this.departmentAlias, eq(JobsTable.departmentId, this.departmentAlias.id))
      .where(whereCondition)
      .limit(1);

    if (!result.length) return null;

    return this.toDomainWithDepartment(result[0]);
  }

  /**
   * Find all jobs belonging to a specific department.
   * Returns jobs without department name join (basic query).
   * 
   * @param departmentId - The UUID of the department to filter jobs by
   * @returns Array of jobs in the specified department with department name
   */
  async findByDepartmentId(departmentId: string): Promise<JobWithDepartmentName[]> {
    const result = await DrizzleClient
      .select()
      .from(JobsTable)
      .where(eq(JobsTable.departmentId, departmentId));

    return result.map(row => this.toDomainWithDepartment(row));
  }

  /**
   * Builds the query directly (no $dynamic() chaining) so that domain-specific
   * filter conditions are ANDed into the same WHERE clause as the soft-delete
   * guard and cursor condition — not replacing them.
   *
   * The LEFT JOIN for department name must be part of the same SELECT so that ORDER BY
   * (when sortBy=departmentName) and cursor WHERE can reference department.name.
   */
  async findAll(params?: ListingQueryInput, isAudit: boolean = false): Promise<JobWithDepartmentName[]> {
    const projection = {
      id: JobsTable.id,
      title: JobsTable.title,
      departmentId: JobsTable.departmentId,
      departmentName: this.departmentAlias.name,
      createdAt: JobsTable.createdAt,
      updatedAt: JobsTable.updatedAt,
      deletedAt: JobsTable.deletedAt,
    };

    if (!params) {
      // No pagination — return all non-deleted rows.
      const result = await DrizzleClient
        .select(projection)
        .from(JobsTable)
        .leftJoin(this.departmentAlias, eq(JobsTable.departmentId, this.departmentAlias.id))
        .where(isAudit ? undefined : isNull(JobsTable.deletedAt));
      return result.map((row: any) => this.toDomainWithDepartment(row));
    }

    // buildListQuery sets _lastSortFields and returns the WHERE / ORDER BY / LIMIT
    // conditions (including soft-delete guard + cursor WHERE).
    const { where, orderBy, limit } = this.buildListQuery(params, isAudit);

    // Append domain-specific filter conditions into the same WHERE array so they
    // are ANDed with the soft-delete guard and cursor condition — not replacing them.
    if (params.filters) {
      for (const f of params.filters) {
        if (f.field === 'departmentId' && f.op === 'eq' && typeof f.value === 'string') {
          where.push(eq(JobsTable.departmentId, f.value));
        }
        if (f.field === 'title' && f.op === 'contains' && typeof f.value === 'string' && f.value.length > 0) {
          where.push(ilike(JobsTable.title, `%${f.value}%`));
        }
      }
    }

    const result = await DrizzleClient
      .select(projection)
      .from(JobsTable)
      .leftJoin(this.departmentAlias, eq(JobsTable.departmentId, this.departmentAlias.id))
      .where(where.length > 0 ? and(...where) : undefined)
      .orderBy(...orderBy)
      .limit(limit);

    return result.map((row: any) => this.toDomainWithDepartment(row));
  }

  /**
   * COUNT(*) of non-deleted jobs matching the same filters as findAll.
   * Does not apply cursor / limit / sort — returns the full matching record count.
   */
  async countAll(params?: ListingQueryInput): Promise<number> {
    const conditions = [isNull(JobsTable.deletedAt)];

    if (params?.filters) {
      for (const f of params.filters) {
        if (f.field === 'departmentId' && f.op === 'eq' && typeof f.value === 'string') {
          conditions.push(eq(JobsTable.departmentId, f.value));
        }
        if (f.field === 'title' && f.op === 'contains' && typeof f.value === 'string' && f.value.length > 0) {
          conditions.push(ilike(JobsTable.title, `%${f.value}%`));
        }
      }
    }

    const result = await DrizzleClient
      .select({ total: count() })
      .from(JobsTable)
      .where(and(...conditions));

    return result[0]?.total ?? 0;
  }

  // Custom mapping from domain entity to database/persistence format
  protected toPersistence(job: Job): any {
    return {
      id: job.id,
      title: job.title.value,
      departmentId: job.departmentId,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      deletedAt: job.deletedAt,
    };
  }

  // Custom mapping from database/persistence format to domain entity
  // Using fromDatabase() factory to skip re-validation of already-validated DB data
  protected toDomain(row: any): Job {
    return new Job(
      row.id,
      JobTitle.fromDatabase(row.title), // Optimized: skip validation for DB data
      row.departmentId,
      row.createdAt,
      row.updatedAt,
      row.deletedAt
    );
  }

  /**
   * Maps a database row with department name to domain entity with department name.
   * Handles flat projection where departmentName comes from LEFT JOIN.
   * Creates Job entity and enriches it with optional departmentName value object.
   * 
   * @param row - Flat database row including departmentName from join
   * @returns Job entity enriched with optional departmentName
   */
  private toDomainWithDepartment(row: any): JobWithDepartmentName {
    // With projection, row is flat: { id, title, departmentId, departmentName, createdAt, ... }
    // departmentName comes directly from the projection (this.departmentAlias.name)
    const job = this.toDomain(row);
    return Object.assign(job, {
      departmentName: row.departmentName
        ? DepartmentName.fromDatabase(row.departmentName)
        : undefined,
    }) as JobWithDepartmentName;
  }
}
