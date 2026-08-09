import {
  BaseError,
  NotFoundError,
  ValidationError,
} from '../../../../shared/exceptions';
import { EMPLOYEE_MESSAGES } from '../constants/employee';

export class EmployeeNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Employee with ID ${id} not found`);
    this.name = 'EmployeeNotFoundError';
  }
}

export class EmployeeAlreadyDeletedError extends NotFoundError {
  constructor(id: string) {
    super(`Employee ${id} has already been deleted`);
    this.name = 'EmployeeAlreadyDeletedError';
  }
}

export class DuplicateActiveEmploymentError extends BaseError {
  constructor() {
    super(
      EMPLOYEE_MESSAGES.ACTIVE_EMPLOYMENT_EXISTS,
      409,
      true,
      'duplicate-active-employment',
      'Duplicate Active Employment'
    );
    this.name = 'DuplicateActiveEmploymentError';
  }
}

export class DuplicateEmployeeNoError extends BaseError {
  constructor(employeeNo: number) {
    super(
      `Employee with number "${employeeNo}" already exists`,
      409,
      true,
      'duplicate-employee-no',
      'Duplicate Employee Number'
    );
    this.name = 'DuplicateEmployeeNoError';
  }
}

export class InvalidEmployeeJobError extends ValidationError {
  constructor(jobId: string) {
    super(`Job with ID ${jobId} not found`);
    this.name = 'InvalidEmployeeJobError';
  }
}

export class InvalidEmployeeOfficeError extends ValidationError {
  constructor(officeId: string) {
    super(`Office with ID ${officeId} not found`);
    this.name = 'InvalidEmployeeOfficeError';
  }
}

export class InvalidEmployeeManagerError extends ValidationError {
  constructor(managerId: string) {
    super(`Manager employee with ID ${managerId} not found`);
    this.name = 'InvalidEmployeeManagerError';
  }
}

export class InvalidEmployeeHierarchyError extends ValidationError {
  constructor(message: string) {
    super(`Invalid employee hierarchy: ${message}`);
    this.name = 'InvalidEmployeeHierarchyError';
  }
}
