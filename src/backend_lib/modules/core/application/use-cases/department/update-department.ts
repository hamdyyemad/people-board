// Ports
import { IDepartmentRepository } from '../../../domain/ports/repositories/department-repository';

// Entities & Value Objects
import { DepartmentName } from '../../../domain/value-objects/department-name';

// DTOs
import { UpdateDepartmentDTO, DepartmentResponseViewModel } from '../../dto/department-dto';

// Exceptions
import {
  DepartmentNotFoundError,
  DuplicateDepartmentNameError,
  InvalidDepartmentHierarchyError,
} from '../../../domain/exceptions/department-exceptions';

export class UpdateDepartmentUseCase {
  constructor(private readonly departmentRepository: IDepartmentRepository) {}

  async execute(input: UpdateDepartmentDTO): Promise<DepartmentResponseViewModel> {
    // Fetch the existing department
    const department = await this.departmentRepository.findById(input.id);
    if (!department || department.deletedAt) {
      throw new DepartmentNotFoundError(input.id);
    }

    // Update name if provided
    if (input.name !== undefined) {
      // Create and validate the new name value object
      const newName = new DepartmentName(input.name);

      // Check for duplicate name (excluding the current department)
      const existingByName = await this.departmentRepository.findByName(newName.value);
      if (existingByName && existingByName.id !== input.id) {
        throw new DuplicateDepartmentNameError(newName.value);
      }

      department.name = newName;
    }

    // Update parentId if provided
    if (input.parentId !== undefined) {
      // Validate hierarchy (prevent circular references)
      if (!department.canHaveParent(input.parentId)) {
        throw new InvalidDepartmentHierarchyError(
          'A department cannot be its own parent'
        );
      }

      // Set parentId (can be null)
      department.parentId = input.parentId || null;
    }

    // Update the timestamp
    department.updatedAt = new Date();

    // Save updated department
    const updatedDepartment = await this.departmentRepository.update(department);

    // Map to response ViewModel
    const mappedDepartment = new DepartmentResponseViewModel(
      updatedDepartment.id,
      updatedDepartment.name.getFormatted(),
      updatedDepartment.parentId,
      updatedDepartment.createdAt,
      updatedDepartment.updatedAt,
      updatedDepartment.isActive()
    );

    return mappedDepartment;
  }
}
