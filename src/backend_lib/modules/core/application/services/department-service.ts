import { IDepartmentRepository } from '../../domain/ports/repositories/department-repository';
import { IIdGenerator } from '../../domain/ports/id-generator';

import { CreateDepartmentUseCase } from '../use-cases/department/create-department';
import { GetDepartmentsUseCase } from '../use-cases/department/get-departments';
import { GetDepartmentsStatsUseCase } from '../use-cases/department/get-departments-stats';
import { GetDepartmentByIdUseCase } from '../use-cases/department/get-department-by-id';
import { UpdateDepartmentUseCase } from '../use-cases/department/update-department';
import { DeleteDepartmentUseCase } from '../use-cases/department/delete-department';

import { CreateDepartmentDTO, UpdateDepartmentDTO } from '../dto/department-dto';
import { ListingQuery, type ListingQueryInput } from '@/backend_lib/shared/listing';

import { CheckParentIdUseCase } from '../use-cases/department/check-parent-id';
import { DepartmentQuery } from '../../validation';

export class DepartmentService {
  constructor(
    private readonly departmentRepository: IDepartmentRepository,
    private readonly idGenerator: IIdGenerator
  ) {}

  async createDepartment(input: { name: string; parentId?: string | null }) {
    const checkParentId = new CheckParentIdUseCase(this.departmentRepository);
    await checkParentId.execute(input.parentId ?? '');

    const useCase = new CreateDepartmentUseCase(this.departmentRepository, this.idGenerator);
    const dto = new CreateDepartmentDTO(input.name, input.parentId ?? undefined);
    return useCase.execute(dto);
  }

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
    const useCase = new GetDepartmentByIdUseCase(this.departmentRepository);
    return useCase.execute(id);
  }

  async updateDepartment(input: { id: string; name?: string; parentId?: string | null }) {
    const checkParentId = new CheckParentIdUseCase(this.departmentRepository);
    await checkParentId.execute(input.parentId ?? '');

    const useCase = new UpdateDepartmentUseCase(this.departmentRepository);
    const dto = new UpdateDepartmentDTO(input.id, input.name, input.parentId ?? undefined);
    return useCase.execute(dto);
  }

  async deleteDepartment(id: string) {
    const useCase = new DeleteDepartmentUseCase(this.departmentRepository);
    return useCase.execute(id);
  }
}
