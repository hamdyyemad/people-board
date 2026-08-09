import { isUuid } from '@/backend_lib/shared/validation';
import { EntityIdError } from '@/backend_lib/shared/exceptions';
import type { EmployeeStatus, RecordOriginType, WorkType } from '../../domain/constants/employee';
import type { EmployeeNo } from '../../domain/value-objects/employee';

// ################# DTOs #################
export class CreateEmployeeDTOInput {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string | null,
    public readonly phoneNumber: string | null,
    public readonly cityId: string,
    public readonly jobId: string,
    public readonly officeId: string,
    public readonly managerId: string | null,
    public readonly status: EmployeeStatus,
    public readonly type: WorkType,
    public readonly recordOrigin: RecordOriginType,
    public readonly contractStart: string,
    public readonly contractEnd: string | null
  ) {
    if (!isUuid(jobId)) throw new EntityIdError('jobId must be a valid UUID');
    if (!isUuid(officeId)) throw new EntityIdError('officeId must be a valid UUID');
    if (managerId !== null && !isUuid(managerId)) {
      throw new EntityIdError('managerId must be a valid UUID');
    }
    if (!isUuid(cityId)) {
      throw new EntityIdError('cityId must be a valid UUID');
    }
  }
}

export class CreateEmployeeDTOOutput {
  constructor(
    public firstName: string,
    public lastName: string,
    public email: string | null,
    public phoneNumber: string | null,
    public cityId: string,
    public jobId: string,
    public officeId: string,
    public managerId: string | null,
    public status: EmployeeStatus,
    public type: WorkType,
    public recordOrigin: RecordOriginType,
    public contractStart: string,
    public contractEnd: string | null
  ) {}
}

export class UpdateEmployeeDTOInput {
  constructor(
    public readonly id: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly email?: string | null,
    public readonly phoneNumber?: string | null,
    public readonly cityId?: string | null,
    public readonly jobId?: string,
    public readonly officeId?: string,
    public readonly managerId?: string | null,
    public readonly status?: EmployeeStatus,
    public readonly type?: WorkType,
    public readonly recordOrigin?: RecordOriginType,
    public readonly contractStart?: string,
    public readonly contractEnd?: string | null
  ) {
    if (!isUuid(id)) throw new EntityIdError('id must be a valid UUID');
    if (jobId !== undefined && !isUuid(jobId)) throw new EntityIdError('jobId must be a valid UUID');
    if (officeId !== undefined && !isUuid(officeId)) throw new EntityIdError('officeId must be a valid UUID');
    if (managerId !== undefined && managerId !== null && !isUuid(managerId)) {
      throw new EntityIdError('managerId must be a valid UUID');
    }
    if (cityId !== undefined && cityId !== null && !isUuid(cityId)) {
      throw new EntityIdError('cityId must be a valid UUID');
    }
  }
}

export class UpdateEmployeeDTOOutput {
  constructor(
    public id: string,
    public firstName?: string,
    public lastName?: string,
    public email?: string | null,
    public phoneNumber?: string | null,
    public cityId?: string | null,
    public jobId?: string,
    public officeId?: string,
    public managerId?: string | null,
    public status?: EmployeeStatus,
    public type?: WorkType,
    public recordOrigin?: RecordOriginType,
    public contractStart?: string,
    public contractEnd?: string | null
  ) {}
}

export class EmployeeByIdDTO {
  constructor(public id: string) {
    if (!isUuid(id)) throw new EntityIdError('id must be a valid UUID');
  }
}

// ############# View Models #############
export class EmployeeResponseViewModel {
  constructor(
    public id: string,
    public personId: string,
    public firstName: string,
    public lastName: string,
    public email: string | null,
    public phoneNumber: string | null,
    public cityId: string | null,
    public cityName: string | undefined,
    public countryName: string | undefined,
    public employeeNo: number | null,
    public jobId: string,
    public jobTitle: string | undefined,
    public officeId: string,
    public officeName: string | undefined,
    public managerId: string | null,
    public status: EmployeeStatus,
    public type: WorkType,
    public recordOrigin: RecordOriginType,
    public contractStart: string,
    public contractEnd: string | null,
    public createdAt: Date,
    public updatedAt: Date,
    public isActive: boolean
  ) {}
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function mapEmployeeToViewModel(row: {
  id: string;
  person_id: string;
  employee_no: EmployeeNo | null;
  job_id: string;
  office_id: string;
  manager_id: string | null;
  status: EmployeeStatus;
  type: WorkType;
  record_origin: RecordOriginType;
  contract_start: Date;
  contract_end: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: () => boolean;
  firstName?: { getFormatted: () => string };
  lastName?: { getFormatted: () => string };
  email?: { value: string } | null;
  phoneNumber?: { value: string } | null;
  personCityId?: string | null;
  cityName?: { getFormatted: () => string };
  countryName?: string;
  jobTitle?: { getFormatted: () => string };
  officeName?: { getFormatted: () => string };
}): EmployeeResponseViewModel {
  return new EmployeeResponseViewModel(
    row.id,
    row.person_id,
    row.firstName?.getFormatted() ?? '',
    row.lastName?.getFormatted() ?? '',
    row.email?.value ?? null,
    row.phoneNumber?.value ?? null,
    row.personCityId ?? null,
    row.cityName?.getFormatted(),
    row.countryName,
    row.employee_no?.value ?? null,
    row.job_id,
    row.jobTitle?.getFormatted(),
    row.office_id,
    row.officeName?.getFormatted(),
    row.manager_id,
    row.status,
    row.type,
    row.record_origin,
    formatDateOnly(row.contract_start),
    row.contract_end ? formatDateOnly(row.contract_end) : null,
    row.createdAt,
    row.updatedAt,
    row.isActive()
  );
}
