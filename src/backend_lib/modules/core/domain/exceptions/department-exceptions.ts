/**
 * Department domain exceptions.
 * Extend shared HTTP-aware errors so the global error middleware returns RFC 7807 responses.
 */

import {
  BaseError,
  NotFoundError,
  ValidationError,
} from '../../../../shared/exceptions';

/** Thrown when a department is not found by id. */
export class DepartmentNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Department with ID ${id} not found`);
    this.name = 'DepartmentNotFoundError';
  }
}

/** Thrown when creating or updating a department with a name that already exists. */
export class DuplicateDepartmentNameError extends BaseError {
  constructor(name: string) {
    super(
      `Department with name "${name}" already exists`,
      409, // Conflict
      true,
      'duplicate-department-name',
      'Duplicate Department Name'
    );
    this.name = 'DuplicateDepartmentNameError';
  }
}

/** Thrown when a department hierarchy is invalid (e.g. circular parent). */
export class InvalidDepartmentHierarchyError extends ValidationError {
  constructor(message: string) {
    super(`Invalid department hierarchy: ${message}`);
    this.name = 'InvalidDepartmentHierarchyError';
  }
}
