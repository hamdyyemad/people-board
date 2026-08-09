/**
 * Person domain exceptions.
 */

import {
  BaseError,
  NotFoundError,
  ValidationError,
} from '../../../../shared/exceptions';

/** Thrown when a person is not found by id. */
export class PersonNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Person with ID ${id} not found`);
    this.name = 'PersonNotFoundError';
  }
}

/** Thrown when a person has already been soft-deleted. */
export class PersonAlreadyDeletedError extends NotFoundError {
  constructor(email: string) {
    super(`Person ${email} has already been deleted`);
    this.name = 'PersonAlreadyDeletedError';
  }
}

/** Thrown when creating or updating a person with an email that already exists. */
export class DuplicatePersonEmailError extends BaseError {
  constructor(email: string) {
    super(
      `Person with email "${email}" already exists`,
      409,
      true,
      'duplicate-person-email',
      'Duplicate Person Email'
    );
    this.name = 'DuplicatePersonEmailError';
  }
}

/** Thrown when creating or updating a person with a phone number that already exists. */
export class DuplicatePersonPhoneError extends BaseError {
  constructor(phoneNumber: string) {
    super(
      `Person with phone number "${phoneNumber}" already exists`,
      409,
      true,
      'duplicate-person-phone',
      'Duplicate Person Phone Number'
    );
    this.name = 'DuplicatePersonPhoneError';
  }
}

/** Thrown when city_id is provided but does not reference an existing city. */
export class InvalidPersonCityError extends ValidationError {
  constructor(cityId: string) {
    super(`City with ID ${cityId} not found`);
    this.name = 'InvalidPersonCityError';
  }
}
