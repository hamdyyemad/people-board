// Ports
import type { IOfficeRepository } from '../../../domain/ports/repositories/office-repository';

// DTOs & ViewModels
import { OfficeResponseViewModel } from '../../dto/office-dto';

// Listing
import { PaginationCursor, PaginationHelper, type ListingQueryInput, type PaginatedResponse } from '@/backend_lib/shared/listing';

export class GetOfficesUseCase {
  constructor(private readonly officeRepository: IOfficeRepository) {}

  /**
   * Pass ListingQueryInput straight to the repository; it handles cursor, filters, order, limit.
   * Then trim limit+1 → items + pagination meta.
   */
  async execute(params: ListingQueryInput): Promise<PaginatedResponse<OfficeResponseViewModel>> {
    const [rows, totalCount] = await Promise.all([
      this.officeRepository.findAll(params),
      this.officeRepository.countAll(params),
    ]);

    const sortFields = this.officeRepository.lastSortFields;

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
        if (field === 'cityName') return row.cityName?.value ?? '';
        if (field === 'countryName') return row.countryName ?? '';
        return (row as Record<string, any>)[field];
      },
      effectiveDirection,
    );

    const data = items.map(
      office =>
        new OfficeResponseViewModel(
          office.id,
          office.name.getFormatted(),
          office.city_id,
          office.cityName ? office.cityName.getFormatted() : undefined,
          office.countryId,
          office.countryName,
          office.address.value,
          office.coordinates.latitude,
          office.coordinates.longitude,
          office.isActive(),
          office.createdAt,
          office.updatedAt
        )
    );

    return {
      data,
      pagination: { hasMore, nextCursor, prevCursor, count: data.length, totalCount },
    };
  }
}
