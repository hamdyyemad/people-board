// Ports
import { IDepartmentRepository } from '../../domain/ports/repositories/department-repository';
import { IIdGenerator } from '../../domain/ports/id-generator';

// Use Cases
import { CreateDepartmentUseCase } from '../use-cases/department/create-department';
import { GetDepartmentsUseCase } from '../use-cases/department/get-departments';
import { GetDepartmentsStatsUseCase } from '../use-cases/department/get-departments-stats';
import { GetDepartmentByIdUseCase } from '../use-cases/department/get-department-by-id';
import { UpdateDepartmentUseCase } from '../use-cases/department/update-department';
import { DeleteDepartmentUseCase } from '../use-cases/department/delete-department';

// DTOs
import { CreateDepartmentDTO, UpdateDepartmentDTO } from '../dto/department-dto';

// Exceptions
import { DepartmentNotFoundError } from '../../domain/exceptions/department-exceptions';

export class DepartmentService {
  constructor(
    private readonly departmentRepository: IDepartmentRepository, 
    private readonly idGenerator: IIdGenerator
  ) {}

  async createDepartment(input: { name: string; parentId?: string | null }) {
    await this.checkDepartmentExists(input.parentId ?? '');
    const useCase = new CreateDepartmentUseCase(this.departmentRepository, this.idGenerator);
    const dto = new CreateDepartmentDTO(input.name, input.parentId ?? undefined);
    return useCase.execute(dto);
  }

  async getDepartments() {
    const useCase = new GetDepartmentsUseCase(this.departmentRepository);
    return useCase.execute();
  }

  async getDepartmentsStats() {
    const useCase = new GetDepartmentsStatsUseCase(this.departmentRepository);
    return useCase.execute();
  }

  async getDepartmentById(id: string) {
    const useCase = new GetDepartmentByIdUseCase(this.departmentRepository);
    return useCase.execute(id);
  }

  async updateDepartment(input: { id: string; name?: string; parentId?: string | null }) {
    const useCase = new UpdateDepartmentUseCase(this.departmentRepository);
    const dto = new UpdateDepartmentDTO(input.id, input.name, input.parentId ?? undefined);
    return useCase.execute(dto);
  }

  async deleteDepartment(id: string) {
    const useCase = new DeleteDepartmentUseCase(this.departmentRepository);
    return useCase.execute(id);
  }

  async checkDepartmentExists(id: string): Promise<boolean> {
    if (!id) return true; // If no parentId is provided, we consider it valid (root department)

    const exist = await this.departmentRepository.existsById(id);

    if (!exist) {
      throw new DepartmentNotFoundError(`Department with ID ${id} does not exist.`);
    }
    
    return exist;
  }
}
