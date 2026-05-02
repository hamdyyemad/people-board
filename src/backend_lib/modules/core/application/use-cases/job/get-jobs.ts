// Ports
import type { IJobRepository } from '../../../domain/ports/repositories/job-repository';

// DTOs & ViewModels
import { JobResponseViewModel } from '../../dto/job-dto';

// Listing
import { PaginationCursor, PaginationHelper, type ListingQueryInput, type PaginatedResponse } from '@/backend_lib/shared/listing';

export class GetJobsUseCase {
  constructor(private readonly jobRepository: IJobRepository) {}

  /**
   * Pass ListingQueryInput straight to the repository; it handles cursor, filters, order, limit.
   * Then trim limit+1 → items + pagination meta.
   */
  async execute(params: ListingQueryInput): Promise<PaginatedResponse<JobResponseViewModel>> {
    const [rows, totalCount] = await Promise.all([
      this.jobRepository.findAll(params),
      this.jobRepository.countAll(params),
    ]);

    const sortFields = this.jobRepository.lastSortFields;

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
        if (field === 'title') return row.title.value;
        return (row as Record<string, any>)[field];
      },
      effectiveDirection,
    );

    const data = items.map(
      job =>
        new JobResponseViewModel(
          job.id,
          job.title.getFormatted(),
          job.departmentId,
          job.departmentName ? job.departmentName.getFormatted() : undefined,
          job.createdAt,
          job.updatedAt,
          job.isActive()
        )
    );

    return {
      data,
      pagination: { hasMore, nextCursor, prevCursor, count: data.length, totalCount },
    };
  }
}
