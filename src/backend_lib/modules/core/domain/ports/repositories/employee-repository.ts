import { IBaseRepository } from './base-repository';

import { Employee } from '../../entities/employee';
import { Person } from '../../entities/person';
import {
  PersonEmail,
  PersonFirstName,
  PersonLastName,
  PersonPhoneNumber,
} from '../../value-objects/person';
import { CityName } from '../../value-objects/city';
import { JobTitle } from '../../value-objects/job';
import { OfficeName } from '../../value-objects/office';
import type { ListingQueryInput } from '@/backend_lib/shared/listing';

export type EmployeeWithDetails = Employee & {
  firstName?: PersonFirstName;
  lastName?: PersonLastName;
  email?: PersonEmail | null;
  phoneNumber?: PersonPhoneNumber | null;
  personCityId?: string | null;
  cityName?: CityName;
  countryName?: string;
  jobTitle?: JobTitle;
  officeName?: OfficeName;
};

export interface IEmployeeRepository extends IBaseRepository<Employee> {
  findByEmployeeNo(employeeNo: number, isAudit?: boolean): Promise<Employee | null>;

  findAll(params?: ListingQueryInput, isAudit?: boolean): Promise<EmployeeWithDetails[]>;

  countAll(params?: ListingQueryInput): Promise<number>;

  findById(id: string, isAudit?: boolean): Promise<EmployeeWithDetails | null>;

  /**
   * Atomically upserts person (by email or phone) and inserts employee in one transaction.
   */
  createHire(person: Person, employee: Employee): Promise<EmployeeWithDetails>;

  /**
   * True when the person has a non-deleted employment that is not terminated or retired.
   */
  hasActiveEmploymentByPersonId(personId: string): Promise<boolean>;

  /**
   * Updates person profile and employee employment fields in one transaction.
   */
  updateHire(person: Person, employee: Employee): Promise<EmployeeWithDetails>;
}
