import { eq, isNull, and } from 'drizzle-orm';
import { DrizzleClient } from '../../../../shared/infrastructure/databases/drizzle-client';
import { departmentsTable } from '../databases/tables/departments-table';
import { IDepartmentRepository } from '../../domain/ports/repositories/department-repository';
import { Department } from '../../domain/entities/department';
import { DepartmentName } from '../../domain/value-objects/department-name';
import { BaseRepository } from './base-repository';

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
}