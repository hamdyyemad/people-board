import { eq, isNull } from 'drizzle-orm';
import { DrizzleClient } from '../databases/drizzle-client';
import { departmentsTable } from '../databases/tables/departments-table';
import { IDepartmentRepository } from '../../domain/ports/repositories/department-repository';
import { Department } from '../../domain/entities/department';
import { DepartmentName } from '../../domain/value-objects/department-name';

export class DepartmentRepository implements IDepartmentRepository {
  async save(department: Department): Promise<Department> {
    await DrizzleClient.insert(departmentsTable).values({
      id: department.id,
      name: department.name.value,
      parentId: department.parentId,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
      deletedAt: department.deletedAt,
    });
    return department;
  }

  async findById(id: string): Promise<Department | null> {
    const result = await DrizzleClient
      .select()
      .from(departmentsTable)
      .where(eq(departmentsTable.id, id))
      .limit(1);

    if (!result.length) return null;
    return this.toDomain(result[0]);
  }

  async findByName(name: string): Promise<Department | null> {
    const result = await DrizzleClient
      .select()
      .from(departmentsTable)
      .where(eq(departmentsTable.name, name))
      .limit(1);

    if (!result.length) return null;
    return this.toDomain(result[0]);
  }

  async findAll(includeDeleted = false): Promise<Department[]> {
    const result = includeDeleted
      ? await DrizzleClient.select().from(departmentsTable)
      : await DrizzleClient.select().from(departmentsTable).where(isNull(departmentsTable.deletedAt));
    return result.map(this.toDomain);
  }

  async findByParentId(parentId: string): Promise<Department[]> {
    const result = await DrizzleClient
      .select()
      .from(departmentsTable)
      .where(eq(departmentsTable.parentId, parentId));

    return result.map(this.toDomain);
  }

  async update(department: Department): Promise<Department> {
    await DrizzleClient
      .update(departmentsTable)
      .set({
        name: department.name.value,
        parentId: department.parentId,
        updatedAt: new Date(),
        deletedAt: department.deletedAt,
      })
      .where(eq(departmentsTable.id, department.id));
    return department;
  }

  async delete(id: string): Promise<void> {
    await DrizzleClient
      .update(departmentsTable)
      .set({ deletedAt: new Date() })
      .where(eq(departmentsTable.id, id));
  }

  private toDomain(row: any): Department {
    return new Department(
      row.id,
      new DepartmentName(row.name),
      row.parentId,
      row.createdAt,
      row.updatedAt,
      row.deletedAt
    );
  }
}