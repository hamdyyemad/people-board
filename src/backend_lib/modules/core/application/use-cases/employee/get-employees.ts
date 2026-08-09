import type { IEmployeeRepository } from '../../../domain/ports/repositories/employee-repository';
import { EmployeeResponseViewModel, mapEmployeeToViewModel } from '../../dto/employee-dto';
import { PaginationCursor, PaginationHelper, type ListingQueryInput, type PaginatedResponse } from '@/backend_lib/shared/listing';

export class GetEmployeesUseCase {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  async execute(params: ListingQueryInput): Promise<PaginatedResponse<EmployeeResponseViewModel>> {
    const [rows, totalCount] = await Promise.all([
      this.employeeRepository.findAll(params),
      this.employeeRepository.countAll(params),
    ]);

    const sortFields = this.employeeRepository.lastSortFields;

    const effectiveDirection = params.pagination.cursor
      ? PaginationCursor.decode(params.pagination.cursor).direction
      : (params.pagination.direction ?? 'forward');

    const { items, hasMore, nextCursor, prevCursor } = PaginationHelper.processPaginatedResults(
      rows,
      params.pagination.limit,
      sortFields,
      params.pagination.cursor,
      (row, field) => {
        if (field === 'employeeNo') return row.employee_no?.value ?? 0;
        if (field === 'firstName') return row.firstName?.value ?? '';
        if (field === 'lastName') return row.lastName?.value ?? '';
        if (field === 'email') return row.email?.value ?? '';
        if (field === 'jobTitle') return row.jobTitle?.value ?? '';
        if (field === 'officeName') return row.officeName?.value ?? '';
        if (field === 'contractStart') return row.contract_start.toISOString().slice(0, 10);
        return (row as unknown as Record<string, unknown>)[field] as string | number | Date;
      },
      effectiveDirection
    );

    return {
      data: items.map((row) => mapEmployeeToViewModel(row)),
      pagination: { hasMore, nextCursor, prevCursor, count: items.length, totalCount },
    };
  }
}
