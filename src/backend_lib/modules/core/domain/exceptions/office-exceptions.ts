/**
 * Office domain exceptions.
 * Extend shared HTTP-aware errors so the global error middleware returns RFC 7807 responses.
 */

import {
  BaseError,
  NotFoundError,
  ValidationError,
} from '../../../../shared/exceptions';

/** Thrown when an Office is not found by id. */
export class OfficeNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Office with ID ${id} not found`);
    this.name = 'OfficeNotFoundError';
  }
}

/** Thrown when an Office has already been deleted. */
export class OfficeAlreadyDeletedError extends NotFoundError {
  constructor(name: string) {
    super(`Office ${name} has already been deleted`);
    this.name = 'OfficeAlreadyDeletedError';
  }
}

/** Thrown when creating or updating an Office with a name that already exists in the same city. */
export class DuplicateOfficeNameError extends BaseError {
  constructor(name: string, cityName?: string) {
    const message = cityName
      ? `Office with name "${name}" already exists in ${cityName}`
      : `Office with name "${name}" already exists in this city`;
    super(
      message,
      409, // Conflict
      true,
      'duplicate-office-name',
      'Duplicate Office Name'
    );
    this.name = 'DuplicateOfficeNameError';
  }
}

/** Thrown when creating or updating an Office with an address that already exists. */
export class DuplicateOfficeAddressError extends BaseError {
  constructor(address: string) {
    super(
      `An office already exists at the address: "${address}"`,
      409, // Conflict
      true,
      'duplicate-office-address',
      'Duplicate Office Address'
    );
    this.name = 'DuplicateOfficeAddressError';
  }
}

/** Thrown when creating or updating an Office with coordinates that already exist. */
export class DuplicateOfficeCoordinatesError extends BaseError {
  constructor(latitude: string, longitude: string) {
    super(
      `An office already exists at the coordinates: ${latitude}, ${longitude}`,
      409, // Conflict
      true,
      'duplicate-office-coordinates',
      'Duplicate Office Coordinates'
    );
    this.name = 'DuplicateOfficeCoordinatesError';
  }
}

/** Thrown when an Office references an invalid or non-existent city. */
export class InvalidOfficeCityError extends ValidationError {
  constructor(cityId: string) {
    super(`Invalid city ID: ${cityId}. City does not exist.`);
    this.name = 'InvalidOfficeCityError';
  }
}

/** Thrown when Office coordinates are invalid (e.g., latitude without longitude). */
export class InvalidOfficeCoordinatesError extends ValidationError {
  constructor(message: string) {
    super(`Invalid office coordinates: ${message}`);
    this.name = 'InvalidOfficeCoordinatesError';
  }
}
