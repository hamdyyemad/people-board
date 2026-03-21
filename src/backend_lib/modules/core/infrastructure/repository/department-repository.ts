import { eq } from 'drizzle-orm';
import { DrizzleClient } from '../../../../shared/infrastructure/databases/drizzle-client';
import { departmentsTable } from '../databases/tables/departments-table';
import { IDepartmentRepository } from '../../domain/ports/repositories/department-repository';
import { Department } from '../../domain/entities/department';
import { DepartmentName } from '../../domain/value-objects/department-name';
import { BaseRepository } from './base-repository';

export class DepartmentRepository extends BaseRepository<Department> implements IDepartmentRepository {
  protected table = departmentsTable;

  async findByParentId(parentId: string): Promise<Department[]> {
    const result = await DrizzleClient
      .select()
      .from(departmentsTable)
      .where(eq(departmentsTable.parentId, parentId));

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