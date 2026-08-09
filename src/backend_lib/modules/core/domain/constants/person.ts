/**
 * Person domain constants.
 * Single source of truth for rule values and messages used by:
 * - value objects (PersonFirstName, PersonLastName, PersonEmail, PersonPhoneNumber),
 * - entities (Person),
 * - validation layer (Zod schemas),
 * - and documented for DB migrations (e.g. CHECK constraints).
 */

// ---- Person name (value objects) ----
export const PERSON_NAME = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 100,
} as const;

export const PERSON_FIRST_NAME_MESSAGES = {
  EMPTY: 'First name cannot be empty',
  TOO_LONG: `First name cannot exceed ${PERSON_NAME.MAX_LENGTH} characters`,
} as const;

export const PERSON_LAST_NAME_MESSAGES = {
  EMPTY: 'Last name cannot be empty',
  TOO_LONG: `Last name cannot exceed ${PERSON_NAME.MAX_LENGTH} characters`,
} as const;

// ---- Person email (value object) ----
export const PERSON_EMAIL = {
  MAX_LENGTH: 254,
} as const;

export const PERSON_EMAIL_MESSAGES = {
  INVALID: 'Email format is invalid',
  TOO_LONG: `Email cannot exceed ${PERSON_EMAIL.MAX_LENGTH} characters`,
} as const;

// ---- Person phone (value object; nullable in DB) ----
export const PERSON_PHONE = {
  MIN_LENGTH: 7,
  MAX_LENGTH: 30,
} as const;

export const PERSON_PHONE_MESSAGES = {
  TOO_SHORT: `Phone number must be at least ${PERSON_PHONE.MIN_LENGTH} characters`,
  TOO_LONG: `Phone number cannot exceed ${PERSON_PHONE.MAX_LENGTH} characters`,
  INVALID: 'Phone number format is invalid',
} as const;

// ---- Person entity invariants ----
export const PERSON_MESSAGES = {
  ID_NOT_FOUND: 'Person with the specified ID does not exist',
  CITY_ID_INVALID: 'Person city_id must be a valid UUID',
  CONTACT_REQUIRED: 'At least one of email or phone number is required',
} as const;

/** API validation messages for person-related UUID fields (Zod schemas). */
export const PERSON_ID_MESSAGES = {
  CITY_ID_REQUIRED: 'city_id is required',
  CITY_ID_INVALID: 'city_id must be a valid UUID',
} as const;
