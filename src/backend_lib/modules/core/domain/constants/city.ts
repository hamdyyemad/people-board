/**
 * City domain constants.
 * Used by the CityName value object and the City entity.
 */

export const CITY_NAME = {
  MAX_LENGTH: 255,
} as const;

export const CITY_NAME_MESSAGES = {
  EMPTY: 'City name cannot be empty',
  TOO_LONG: `City name cannot exceed ${CITY_NAME.MAX_LENGTH} characters`,
} as const;

export const CITY_MESSAGES = {
  ID_NOT_FOUND: 'City with the specified ID does not exist',
  COUNTRY_ID_INVALID: 'City country_id must be a valid UUID',
} as const;
