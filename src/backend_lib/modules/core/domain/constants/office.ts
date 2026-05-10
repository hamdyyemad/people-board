/**
 * Office domain constants.
 * Single source of truth for rule values and messages used by:
 * - value objects (OfficeName, OfficeAddress, OfficeCoordinates),
 * - entities (Office),
 * - validation layer (Zod schemas),
 * - and documented for DB migrations (e.g. CHECK constraints).
 */

// ---- Office name (value object) ----
export const OFFICE_NAME = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 150,
} as const;

export const OFFICE_NAME_MESSAGES = {
  EMPTY: 'Office name cannot be empty',
  TOO_LONG: `Office name cannot exceed ${OFFICE_NAME.MAX_LENGTH} characters`,
} as const;

// ---- Office address (value object; nullable in DB) ----
export const OFFICE_ADDRESS = {
  MAX_LENGTH: 2000,
} as const;

export const OFFICE_ADDRESS_MESSAGES = {
  TOO_LONG: `Office address cannot exceed ${OFFICE_ADDRESS.MAX_LENGTH} characters`,
} as const;

// ---- Office coordinates WGS 84 (value object; nullable pair in DB) ----
export const OFFICE_COORDINATES_MESSAGES = {
  LAT_LON_PAIR: 'Office latitude and longitude must both be set or both be omitted',
  LATITUDE_RANGE: 'Office latitude must be between -90 and 90 decimal degrees',
  LONGITUDE_RANGE: 'Office longitude must be between -180 and 180 decimal degrees',
  LATITUDE_INVALID: 'Office latitude is not a valid decimal number',
  LONGITUDE_INVALID: 'Office longitude is not a valid decimal number',
} as const;

// ---- Office entity invariants ----
export const OFFICE_MESSAGES = {
  ID_NOT_FOUND: 'Office with the specified ID does not exist',
  CITY_ID_INVALID: 'Office city_id must be a valid UUID',
} as const;
