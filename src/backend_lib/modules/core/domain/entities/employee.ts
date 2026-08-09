/**
 * Employee Entity
 *
 * Database Table: employees
 * Schema Last Updated: migration 001_initial_schema.sql
 *
 * Links a Person (identity) to employment details: job, office, contract, status.
 * Person profile fields live on `people`; create via employee use cases, not a separate person API.
 */
import { BaseEntity } from './base-entity';
import { EmployeeNo } from '../value-objects/employee';
import { EmployeeCreatedEvent } from '../events/employee/employee-created';
import {
  EMPLOYEE_MESSAGES,
  type EmployeeStatus,
  type RecordOriginType,
  type WorkType,
  isEmployeeStatus,
  isRecordOriginType,
  isWorkType,
} from '../constants/employee';
import { isUuid } from '@/backend_lib/shared/validation';
import { ValidationError } from '@/backend_lib/shared/exceptions';

export class Employee extends BaseEntity<EmployeeCreatedEvent> {
  constructor(
    public id: string,
    public person_id: string,
    public employee_no: EmployeeNo | null,
    public job_id: string,
    public office_id: string,
    public manager_id: string | null,
    public status: EmployeeStatus,
    public type: WorkType,
    public record_origin: RecordOriginType,
    public contract_start: Date,
    public contract_end: Date | null,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this.init();
  }

  protected validate(): void {
    if (!isUuid(this.person_id)) {
      throw new ValidationError(EMPLOYEE_MESSAGES.PERSON_ID_INVALID);
    }
    if (!isUuid(this.job_id)) {
      throw new ValidationError(EMPLOYEE_MESSAGES.JOB_ID_INVALID);
    }
    if (!isUuid(this.office_id)) {
      throw new ValidationError(EMPLOYEE_MESSAGES.OFFICE_ID_INVALID);
    }
    if (this.manager_id !== null && !isUuid(this.manager_id)) {
      throw new ValidationError(EMPLOYEE_MESSAGES.MANAGER_ID_INVALID);
    }
    if (this.manager_id === this.id) {
      throw new ValidationError(EMPLOYEE_MESSAGES.OWN_MANAGER);
    }
    if (!isEmployeeStatus(this.status)) {
      throw new ValidationError(EMPLOYEE_MESSAGES.INVALID_STATUS);
    }
    if (!isWorkType(this.type)) {
      throw new ValidationError(EMPLOYEE_MESSAGES.INVALID_WORK_TYPE);
    }
    if (!isRecordOriginType(this.record_origin)) {
      throw new ValidationError(EMPLOYEE_MESSAGES.INVALID_RECORD_ORIGIN);
    }
    if (this.contract_end !== null && this.contract_end < this.contract_start) {
      throw new ValidationError(EMPLOYEE_MESSAGES.INVALID_CONTRACT_DATES);
    }
  }

  canHaveManager(managerId: string | null): boolean {
    return managerId === null || managerId !== this.id;
  }
}
