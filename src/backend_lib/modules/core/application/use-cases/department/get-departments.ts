import type { IDepartmentRepository } from '../../../domain/ports/repositories/department-repository';
import { DepartmentResponseViewModel } from '../../dto/department-dto';
import { PaginationHelper, type ListingQueryInput, type PaginatedResponse } from '@/backend_lib/shared/listing';

export class GetDepartmentsUseCase {
  constructor(private readonly departmentRepository: IDepartmentRepository) {}

  /**
   * Pass ListingQueryInput straight to the repository; it handles cursor, filters, order, limit.
   * Then trim limit+1 → items + pagination meta.
   */
  async execute(params: ListingQueryInput): Promise<PaginatedResponse<DepartmentResponseViewModel>> {
    const rows = await this.departmentRepository.findAll(params);

    const { items, hasMore, nextCursor, prevCursor } = PaginationHelper.processPaginatedResults(
      rows,
      params.pagination.limit,
      params.pagination.direction ?? 'forward'
    );

    const data = items.map(
      dept =>
        new DepartmentResponseViewModel(
          dept.id,
          dept.name.getFormatted(),
          dept.parentId,
          dept.parentName,
          dept.createdAt,
          dept.updatedAt,
          dept.isActive()
        )
    );

    return {
      data,
      pagination: { hasMore, nextCursor, prevCursor, count: data.length },
    };
  }
}
