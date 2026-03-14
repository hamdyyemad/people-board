// src/backend_lib/modules/core/application/use-cases/create-department.ts
import { Department } from '../../../domain/entities/department';
import { DepartmentName } from '../../../domain/value-objects/department-name';
import { IDepartmentRepository } from '../../../domain/ports/repositories/department-repository';
import { DuplicateDepartmentNameError } from '../../../domain/exceptions/department-exceptions';
import { CreateDepartmentDTO } from '../../dto/department-dto';

export class CreateDepartmentUseCase {
  constructor(private departmentRepository: IDepartmentRepository) {}

  async execute(input: CreateDepartmentDTO): Promise<Department> {
    // Check for duplicate name
    const existing = await this.departmentRepository.findByName(input.name);
    if (existing) {
      throw new DuplicateDepartmentNameError(input.name);
    }

    // Create domain entity
    const departmentName = new DepartmentName(input.name);
    const department = new Department(
      this.generateId(),
      departmentName,
      input.parentId || null
    );

    // Save via repository
    return this.departmentRepository.save(department);
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}