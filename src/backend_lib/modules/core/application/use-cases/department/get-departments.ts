// Ports
import type { IDepartmentRepository } from '../../../domain/ports/repositories/department-repository';

// DTOs & ViewModels
import { DepartmentResponseViewModel } from '../../dto/department-dto';

// Listing
import { PaginationCursor, PaginationHelper, type ListingQueryInput, type PaginatedResponse } from '@/backend_lib/shared/listing';

export class GetDepartmentsUseCase {
  constructor(private readonly departmentRepository: IDepartmentRepository) {}

  /**
   * Pass ListingQueryInput straight to the repository; it handles cursor, filters, order, limit.
   * Then trim limit+1 → items + pagination meta.
   */
  async execute(params: ListingQueryInput): Promise<PaginatedResponse<DepartmentResponseViewModel>> {
    const [rows, totalCount] = await Promise.all([
      this.departmentRepository.findAll(params),
      this.departmentRepository.countAll(params),
    ]);

    const sortFields = this.departmentRepository.lastSortFields;

    // Resolve the actual direction — mirrors base-repository logic.
    // When a cursor is present its embedded _dir is authoritative (Zod schema defaults
    // direction to 'forward' so we cannot distinguish "not sent" from "explicitly forward").
    const effectiveDirection = params.pagination.cursor
      ? PaginationCursor.decode(params.pagination.cursor).direction
      : (params.pagination.direction ?? 'forward');

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
      pagination: { hasMore, nextCursor, prevCursor, count: data.length, totalCount },
    };
  }
}
