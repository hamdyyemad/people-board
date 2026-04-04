import type { IDepartmentRepository } from '../../../domain/ports/repositories/department-repository';
import { DepartmentResponseViewModel } from '../../dto/department-dto';
import { PaginationCursor, PaginationHelper, type ListingQueryInput, type PaginatedResponse } from '@/backend_lib/shared/listing';

export class GetDepartmentsUseCase {
  constructor(private readonly departmentRepository: IDepartmentRepository) {}

  /**
   * Pass ListingQueryInput straight to the repository; it handles cursor, filters, order, limit.
   * Then trim limit+1 → items + pagination meta.
   */
  async execute(params: ListingQueryInput): Promise<PaginatedResponse<DepartmentResponseViewModel>> {
    const rows = await this.departmentRepository.findAll(params);
    const sortFields = this.departmentRepository.lastSortFields;

    // Resolve the actual direction used — cursor-embedded direction is the authoritative
    // source when no explicit direction param was sent (same logic as base-repository).
    const effectiveDirection =
      params.pagination.direction ??
      (params.pagination.cursor
        ? PaginationCursor.decode(params.pagination.cursor).direction
        : 'forward');

    const { items, hasMore, nextCursor, prevCursor } = PaginationHelper.processPaginatedResults(
      rows,
      params.pagination.limit,
      sortFields,
      params.pagination.cursor,
      (row, field) => {
        if (field === 'name') return row.name.value;
        return (row as Record<string, any>)[field];
      },
      effectiveDirection,
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
