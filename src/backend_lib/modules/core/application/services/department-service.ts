// Ports
import { IDepartmentRepository } from '../../domain/ports/repositories/department-repository';
import { IIdGenerator } from '../../domain/ports/id-generator';

// Use Cases
import { 
  GetDepartmentsUseCase,
  CheckParentIdUseCase,
  GetDepartmentsStatsUseCase,
  GetDepartmentByIdUseCase,
  CreateDepartmentUseCase,
  UpdateDepartmentUseCase,
  DeleteDepartmentUseCase
} from '../use-cases/department';

// DTOs
import { 
  CreateDepartmentDTOInput, 
  CreateDepartmentDTOOutput, 
  DepartmentByIdDTO, 
  UpdateDepartmentDTOInput, 
  UpdateDepartmentDTOOutput 
} from '../dto/department-dto';
import { ListingQuery } from '@/backend_lib/shared/listing';
import { DepartmentQuery } from '../../validation';


export class DepartmentService {
  constructor(
    private readonly departmentRepository: IDepartmentRepository,
    private readonly idGenerator: IIdGenerator
  ) {}

  /**
   * ListingQueryInput goes straight through: route → service → use case → repository.
   * No intermediate mapping needed.
   */
  async getDepartments(q: DepartmentQuery) {
    // Early exit: If a specific ID is provided, bypass listing logic
    if(q.id) {
      const department = await this.getDepartmentById(q.id);

      return {
        data: department ? [department] : [],
        nextCursor: null, // Since there's only max 1 result, there is no next page
        prevCursor: null, // Since there's only max 1 result, there is no previous page
        total: department ? 1 : 0 // Include this if your DTO expects a total count
      };
    }

    let builder = new ListingQuery()
      .paginate(q.limit, q.cursor, q.direction)
      .sortFromArrays(q.sortBy, q.sortOrder);

    // Apply filters based on query parameters. The repository will combine them with AND. 
    if (q.parentId) builder = builder.filter({ field: 'parentId', op: 'eq', value: q.parentId });
    if (q.name)     builder = builder.filter({ field: 'name', op: 'contains', value: q.name });

    const useCase = new GetDepartmentsUseCase(this.departmentRepository);
    return useCase.execute(builder.build());
  }

  async getDepartmentsStats() {
    const useCase = new GetDepartmentsStatsUseCase(this.departmentRepository);
    return useCase.execute();
  }

  async getDepartmentById(id: string) {
    const DTO = new DepartmentByIdDTO(id);

    const useCase = new GetDepartmentByIdUseCase(this.departmentRepository);

    return useCase.execute(DTO.id);
  }

  async createDepartment(input: { name: string; parentId: string | null }) {
    const command = new CreateDepartmentDTOInput(input.name, input.parentId);

    const checkParentId = new CheckParentIdUseCase(this.departmentRepository);
    await checkParentId.execute(command.parentId ?? '');

    const useCase = new CreateDepartmentUseCase(this.departmentRepository, this.idGenerator);
    
    const dto = new CreateDepartmentDTOOutput(command.name, command.parentId ?? undefined);
    
    return useCase.execute(dto);
  }

  async updateDepartment(input: { id: string; name?: string; parentId?: string }) {
    const command = new UpdateDepartmentDTOInput(input.id, input.name, input.parentId);
    
    const checkParentId = new CheckParentIdUseCase(this.departmentRepository);
    await checkParentId.execute(command.parentId ?? '');

    const useCase = new UpdateDepartmentUseCase(this.departmentRepository);
    
    const dto = new UpdateDepartmentDTOOutput(command.id, command.name, command.parentId ?? undefined);
    
    return useCase.execute(dto);
  }

  async deleteDepartment(id: string) {
    const DTO = new DepartmentByIdDTO(id);

    const useCase = new DeleteDepartmentUseCase(this.departmentRepository);

    return useCase.execute(DTO.id);
  }
}
