// Ports
import { IDepartmentRepository } from '../../../domain/ports/repositories/department-repository';
import { IIdGenerator } from '../../../domain/ports/id-generator';

// Entities & Value Objects
import { DepartmentName } from '../../../domain/value-objects/department-name';
import { Department } from '../../../domain/entities/department';

// DTOs
import { CreateDepartmentDTO, DepartmentResponseViewModel } from '../../dto/department-dto';

// Exceptions
import { DuplicateDepartmentNameError } from '../../../domain/exceptions/department-exceptions';

export class CreateDepartmentUseCase {
  constructor(
    private departmentRepository: IDepartmentRepository,
    private idGenerator: IIdGenerator
  ) {}

  async execute(input: CreateDepartmentDTO): Promise<DepartmentResponseViewModel> {
    // Create value object (this will also validate the name and normalize it)
    const departmentName = new DepartmentName(input.name);

    // Check for duplicate name
    const existing = await this.departmentRepository.findByName(departmentName.value);
    if (existing) {
      throw new DuplicateDepartmentNameError(departmentName.value);
    }

    // Create domain entity
    const department = new Department(
      this.idGenerator.generate(),
      departmentName,
      input.parentId || null
    );

    // Save via repository
    const savedDepartment = await this.departmentRepository.save(department);
    
    const mappedDepartment = new DepartmentResponseViewModel(
        savedDepartment.id, 
        savedDepartment.name.getFormatted(), 
        savedDepartment.parentId, 
        undefined,
        savedDepartment.createdAt, 
        savedDepartment.updatedAt,
        savedDepartment.isActive()
    );
    
    return mappedDepartment;
  }
}