// ORM (Drizzle) repository implementation for Department aggregate
import { eq, isNull, and, count, sql, ilike } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { DrizzleClient } from '../../../../shared/infrastructure/databases/drizzle-client';
import { departmentsTable } from '../databases/tables/departments-table';

// Base repository
import { BaseRepository } from './base-repository';

// Domain
import {
  IDepartmentRepository,
  type DepartmentWithParentName,
} from '../../domain/ports/repositories/department-repository';
import { Department } from '../../domain/entities/department';
import { DepartmentName } from '../../domain/value-objects/department-name';

// DTOs
import { DepartmentStatsDTO } from '../../application/dto/department-dto';
import type { ListingQueryInput } from '../../../../shared/listing';

export class DepartmentRepository extends BaseRepository<Department> implements IDepartmentRepository {
  protected table = departmentsTable;
  private readonly parentAlias = alias(departmentsTable, 'parent');

  protected resolveColumn(field: string): any {
    if (field === 'parentName') return this.parentAlias.name;
    return super.resolveColumn(field);
  }

  /**
   * Find all departments under a specific parent
   * 
   * @param parentId - The parent department ID to search for
   * @param isAudit - If true, includes soft-deleted departments (audit mode). Default: false
   */
  async findByParentId(parentId: string, isAudit: boolean = false): Promise<Department[]> {
    // Build WHERE conditions: always check parent, optionally exclude deleted
    const whereCondition = !isAudit
      ? and(
          eq(departmentsTable.parentId, parentId),
          isNull(departmentsTable.deletedAt)
        )
      : eq(departmentsTable.parentId, parentId);

    const result = await DrizzleClient
      .select()
      .from(departmentsTable)
      .where(whereCondition);

    return result.map(row => this.toDomain(row));
  }

  /**
   * Builds the query directly (no $dynamic() chaining) so that domain-specific
   * filter conditions are ANDed into the same WHERE clause as the soft-delete
   * guard and cursor condition — not replacing them.
   *
   * The LEFT JOIN for parent name must be part of the same SELECT so that ORDER BY
   * (when sortBy=parentName) and cursor WHERE can reference parent.name.
   */
  async findAll(params?: ListingQueryInput, isAudit: boolean = false): Promise<DepartmentWithParentName[]> {
    const projection = {
      id: departmentsTable.id,
      name: departmentsTable.name,
      parentId: departmentsTable.parentId,
      parentName: this.parentAlias.name,
      createdAt: departmentsTable.createdAt,
      updatedAt: departmentsTable.updatedAt,
      deletedAt: departmentsTable.deletedAt,
    };

    if (!params) {
      // No pagination — return all non-deleted rows.
      const result = await DrizzleClient
        .select(projection)
        .from(departmentsTable)
        .leftJoin(this.parentAlias, eq(departmentsTable.parentId, this.parentAlias.id))
        .where(isAudit ? undefined : isNull(departmentsTable.deletedAt));
      return result.map((row: any) => this.toDomainWithParent(row));
    }

    // buildListQuery sets _lastSortFields and returns the WHERE / ORDER BY / LIMIT
    // conditions (including soft-delete guard + cursor WHERE).
    const { where, orderBy, limit } = this.buildListQuery(params, isAudit);

    // Append domain-specific filter conditions into the same WHERE array so they
    // are ANDed with the soft-delete guard and cursor condition — not replacing them.
    if (params.filters) {
      for (const f of params.filters) {
        if (f.field === 'parentId' && f.op === 'eq' && typeof f.value === 'string') {
          where.push(eq(departmentsTable.parentId, f.value));
        }
        if (f.field === 'name' && f.op === 'contains' && typeof f.value === 'string' && f.value.length > 0) {
          where.push(ilike(departmentsTable.name, `%${f.value}%`));
        }
      }
    }

    const result = await DrizzleClient
      .select(projection)
      .from(departmentsTable)
      .leftJoin(this.parentAlias, eq(departmentsTable.parentId, this.parentAlias.id))
      .where(where.length > 0 ? and(...where) : undefined)
      .orderBy(...orderBy)
      .limit(limit);

    return result.map((row: any) => this.toDomainWithParent(row));
  }

  /**
   * COUNT(*) of non-deleted departments matching the same filters as findAll.
   * Does not apply cursor / limit / sort — returns the full matching record count.
   */
  async countAll(params?: ListingQueryInput): Promise<number> {
    const conditions = [isNull(departmentsTable.deletedAt)];

    if (params?.filters) {
      for (const f of params.filters) {
        if (f.field === 'parentId' && f.op === 'eq' && typeof f.value === 'string') {
          conditions.push(eq(departmentsTable.parentId, f.value));
        }
        if (f.field === 'name' && f.op === 'contains' && typeof f.value === 'string' && f.value.length > 0) {
          conditions.push(ilike(departmentsTable.name, `%${f.value}%`));
        }
      }
    }

    const result = await DrizzleClient
      .select({ total: count() })
      .from(departmentsTable)
      .where(and(...conditions));

    return result[0]?.total ?? 0;
  }

  /**
   * Get department statistics
   *
   * @returns DepartmentStatsDTO with counts of total, top-level, and sub-departments
   */
  async getStats(): Promise<DepartmentStatsDTO> {
    // Single database query to get all stats at once using CASE expressions
    const result = await DrizzleClient
      .select({
        totalDepartments: count(),
        topLevelDepartments: count(
          sql`CASE WHEN ${departmentsTable.parentId} IS NULL THEN 1 END`
        ),
        subDepartments: count(
          sql`CASE WHEN ${departmentsTable.parentId} IS NOT NULL THEN 1 END`
        ),
      })
      .from(departmentsTable)
      .where(isNull(departmentsTable.deletedAt));

    const stats = result[0];
    return new DepartmentStatsDTO(
      stats.totalDepartments,
      stats.topLevelDepartments,
      stats.subDepartments
    );
  }

  // Custom mapping from domain entity to database/persistence format
  protected toPersistence(department: Department): any {
    return {
      id: department.id,
      name: department.name.value,
      parentId: department.parentId,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
      deletedAt: department.deletedAt,
    };
  }

  // Custom mapping from database/persistence format to domain entity
  // Using fromDatabase() factory to skip re-validation of already-validated DB data
  protected toDomain(row: any): Department {
    return new Department(
      row.id,
      DepartmentName.fromDatabase(row.name), // Optimized: skip validation for DB data
      row.parentId,
      row.createdAt,
      row.updatedAt,
      row.deletedAt
    );
  }

  private toDomainWithParent(row: any): DepartmentWithParentName {
    // With projection, row is flat: { id, name, parentId, parentName, createdAt, ... }
    // parentName comes directly from the projection (this.parentAlias.name)
    const department = this.toDomain(row);
    return Object.assign(department, {
      parentName: row.parentName
        ? DepartmentName.fromDatabase(row.parentName).getFormatted()
        : undefined,
    }) as DepartmentWithParentName;
  }
}
