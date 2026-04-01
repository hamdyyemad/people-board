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
    let builder = new ListingQuery()
      .paginate(q.limit, q.cursor, q.direction)
      .sort({ field: q.sortBy, direction: q.sortOrder });

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
