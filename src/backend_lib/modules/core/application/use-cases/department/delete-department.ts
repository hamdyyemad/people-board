// Ports
import { IDepartmentRepository } from '../../../domain/ports/repositories/department-repository';

// Exceptions
import { DepartmentNotFoundError, DepartmentAlreadyDeletedError } from '../../../domain/exceptions/department-exceptions';

export class DeleteDepartmentUseCase {
  constructor(private readonly departmentRepository: IDepartmentRepository) {}

  async execute(id: string): Promise<void> {
    // Verify the department exists before deletion
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw new DepartmentNotFoundError(id);
    }

    // Check if already deleted
    if (department.deletedAt) {
        throw new DepartmentAlreadyDeletedError(department.name.value);
    }

    // Delete parent Department
    await this.departmentRepository.delete(id);
    
    // Delete all children recursively
    const children = await this.departmentRepository.findByParentId(id, true);
    for (const child of children) {
      if (!child.deletedAt) {
        await this.execute(child.id);
      }
    }
  }
}
