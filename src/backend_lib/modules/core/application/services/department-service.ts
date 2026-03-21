// Ports
import { IDepartmentRepository } from '../../domain/ports/repositories/department-repository';
import { IIdGenerator } from '../../domain/ports/id-generator';

// Use Cases
import { CreateDepartmentUseCase } from '../use-cases/department/create-department';
import { GetDepartmentsUseCase } from '../use-cases/department/get-departments';
import { GetDepartmentByIdUseCase } from '../use-cases/department/get-department-by-id';

// DTOs
import { CreateDepartmentDTO } from '../dto/department-dto';

export class DepartmentService {
  constructor(
    private readonly departmentRepository: IDepartmentRepository, 
    private readonly idGenerator: IIdGenerator
  ) {}

  async createDepartment(input: { name: string; parentId?: string | null }) {
    const useCase = new CreateDepartmentUseCase(this.departmentRepository, this.idGenerator);
    const dto = new CreateDepartmentDTO(input.name, input.parentId ?? undefined);
    return useCase.execute(dto);
  }

  async getDepartments() {
    const useCase = new GetDepartmentsUseCase(this.departmentRepository);
    return useCase.execute();
  }

  async getDepartmentById(id: string) {
    const useCase = new GetDepartmentByIdUseCase(this.departmentRepository);
    return useCase.execute(id);
  }
}
