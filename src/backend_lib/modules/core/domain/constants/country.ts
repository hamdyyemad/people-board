/**
 * Country domain constants.
 * Single source of truth for rule values and messages used by:
 * - value objects (CountryName),
 * - entities (Country),
 * - validation layer (Zod schemas),
 * - and documented for DB migrations (e.g. CHECK constraints).
 */

// ---- Country name (value object) ----
export const COUNTRY_NAME = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 80,
} as const;

export const COUNTRY_NAME_MESSAGES = {
  REQUIRED: 'name is required',
  EMPTY: 'Country name cannot be empty',
  TOO_LONG: `Country name cannot exceed ${COUNTRY_NAME.MAX_LENGTH} characters`,
  DOES_NOT_MATCH_ISO:
    'Country name does not match the expected name for this ISO code and dialing prefix',
} as const;

// ---- Country ISO code (value object) ----
export const COUNTRY_ISO_CODE = {
  LENGTH: 2,
} as const;

export const COUNTRY_ISO_CODE_MESSAGES = {
  INVALID: 'ISO code must be exactly 2 letters (ISO 3166-1 alpha-2)',
  NOT_IN_DATASET: 'ISO code is not in the supported countries list',
} as const;

// ---- Country phone / dialing code (value object) ----
export const COUNTRY_PHONE_CODE = {
  /** Max digits after + for a country calling prefix (covers longer codes, e.g. +1242) */
  MAX_DIGITS_AFTER_PLUS: 4,
} as const;

export const COUNTRY_PHONE_CODE_MESSAGES = {
  EMPTY: 'Phone code is required',
  INVALID_FORMAT:
    'Phone code must be an international dialing prefix starting with + followed by digits (e.g. +20)',
  DOES_NOT_MATCH_ISO: 'Phone code does not match the dialing prefix for this country ISO code',
} as const;

export const COUNTRY_MESSAGES = {
  ID_NOT_FOUND: 'Country with the specified ID does not exist',
  ISO_CODE_NOT_FOUND: 'Country ISO code is required',
  NAME_NOT_FOUND: 'Country name is required',
  PHONE_CODE_NOT_FOUND: 'Country phone code is required',
} as const;