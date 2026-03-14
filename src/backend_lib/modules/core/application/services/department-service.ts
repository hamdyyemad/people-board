import { IDepartmentRepository } from '../../domain/ports/repositories/department-repository';
import { CreateDepartmentUseCase } from '../use-cases/department/create-department';
import { CreateDepartmentDTO } from '../dto/department-dto';

export class DepartmentService {
  constructor(private readonly departmentRepository: IDepartmentRepository) {}

  async createDepartment(input: { name: string; parentId?: string | null }) {
    const useCase = new CreateDepartmentUseCase(this.departmentRepository);
    const dto = new CreateDepartmentDTO(input.name, input.parentId ?? undefined);
    return useCase.execute(dto);
  }
}
