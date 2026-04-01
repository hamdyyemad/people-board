import { eq, isNull, and, count, sql, ilike } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { DrizzleClient } from '../../../../shared/infrastructure/databases/drizzle-client';
import { departmentsTable } from '../databases/tables/departments-table';
import {
  IDepartmentRepository,
  type DepartmentWithParentName,
} from '../../domain/ports/repositories/department-repository';
import { Department } from '../../domain/entities/department';
import { DepartmentName } from '../../domain/value-objects/department-name';
import { BaseRepository } from './base-repository';
import { DepartmentStatsDTO } from '../../application/dto/department-dto';
import type { ListingQueryInput } from '../../../../shared/listing';

export class DepartmentRepository extends BaseRepository<Department> implements IDepartmentRepository {
  protected table = departmentsTable;

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
   * Calls super.findAll(params) to get the base query (not awaited),
   * then chains .leftJoin() for parent name, and awaits.
   */
  async findAll(params?: ListingQueryInput, isAudit: boolean = false): Promise<DepartmentWithParentName[]> {
    const parentDepts = alias(departmentsTable, 'parent');

    // super.findAll returns a $dynamic() query builder — not awaited
    const query = super.findAll(params, isAudit);

    // Push domain-specific filters when paginated
    if (params?.filters) {
      const extraConditions = [];
      for (const f of params.filters) {
        if (f.field === 'parentId' && f.op === 'eq' && typeof f.value === 'string') {
          extraConditions.push(eq(departmentsTable.parentId, f.value));
        }
        if (f.field === 'name' && f.op === 'contains' && typeof f.value === 'string' && f.value.length > 0) {
          extraConditions.push(ilike(departmentsTable.name, `%${f.value}%`));
        }
      }
      if (extraConditions.length > 0) {
        query.where(and(...extraConditions));
      }
    }

    // Chain the join and await
    const result = await query.leftJoin(parentDepts, eq(departmentsTable.parentId, parentDepts.id));

    return result.map((row: any) => this.toDomainWithParent(row));
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
    // After .leftJoin(), Drizzle nests: { departments: {...}, parent: {...} }
    const dept = row.departments ?? row;
    const parent = row.parent;

    const department = this.toDomain(dept);
    return Object.assign(department, {
      parentName: parent?.name
        ? DepartmentName.fromDatabase(parent.name).getFormatted()
        : undefined,
    }) as DepartmentWithParentName;
  }
}
