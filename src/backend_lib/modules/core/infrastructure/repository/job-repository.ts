// ORM (Drizzle) repository implementation for Job aggregate
import { eq, isNull, and, count, ilike } from 'drizzle-orm';
import { DrizzleClient } from '../../../../shared/infrastructure/databases/drizzle-client';
import { JobsTable } from '../databases/tables/jobs-table';

// Base repository
import { BaseRepository } from './base-repository';

// Domain
import { IJobRepository } from '../../domain/ports/repositories/job-repository';
import { Job } from '../../domain/entities/job';
import { JobTitle } from '../../domain/value-objects/job-title';

// DTOs
import type { ListingQueryInput } from '../../../../shared/listing';

export class JobRepository extends BaseRepository<Job> implements IJobRepository {
  protected table = JobsTable;

  async findByDepartmentId(departmentId: string): Promise<Job[]> {
    const result = await DrizzleClient
      .select()
      .from(JobsTable)
      .where(eq(JobsTable.departmentId, departmentId));

    return result.map(row => this.toDomain(row));
  }

  /**
   * Builds the query directly (no $dynamic() chaining) so that domain-specific
   * filter conditions are ANDed into the same WHERE clause as the soft-delete
   * guard and cursor condition — not replacing them.
   */
  async findAll(params?: ListingQueryInput, isAudit: boolean = false): Promise<Job[]> {
    if (!params) {
      // No pagination — return all non-deleted rows.
      const result = await DrizzleClient
        .select()
        .from(JobsTable)
        .where(isAudit ? undefined : isNull(JobsTable.deletedAt));
      return result.map(row => this.toDomain(row));
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
      .select()
      .from(JobsTable)
      .where(where.length > 0 ? and(...where) : undefined)
      .orderBy(...orderBy)
      .limit(limit);

    return result.map(row => this.toDomain(row));
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
}
