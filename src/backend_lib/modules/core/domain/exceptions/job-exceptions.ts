/**
 * Job domain exceptions.
 * Extend shared HTTP-aware errors so the global error middleware returns RFC 7807 responses.
 */

import {
  BaseError,
  NotFoundError
} from '../../../../shared/exceptions';

/** Thrown when a Job is not found by id. */
export class JobNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Job with ID ${id} not found`);
    this.name = 'JobNotFoundError';
  }
}

/** Thrown when a Job has already been deleted. */
export class JobAlreadyDeletedError extends NotFoundError {
  constructor(name: string) {
    super(`Job ${name} has already been deleted`);
    this.name = 'JobAlreadyDeletedError';
  }
}

/** Thrown when creating or updating a Job with a name that already exists. */
export class DuplicateJobNameError extends BaseError {
  constructor(name: string) {
    super(
      `Job with name "${name}" already exists`,
      409, // Conflict
      true,
      'duplicate-job-name',
      'Duplicate Job Name'
    );
    this.name = 'DuplicateJobNameError';
  }
}