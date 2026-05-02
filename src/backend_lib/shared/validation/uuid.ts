/**
 * UUID validation utilities.
 *
 * This exists because TypeScript doesn't provide runtime validation like other frameworks (e.g., .NET).
 * We can't write `function fn(id: uuid) {}` and have it validated at runtime.
 * Instead, we must validate UUIDs explicitly using DTOs and validation schemas.
 */

export const UUID_SHAPE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  return UUID_SHAPE.test(value.trim());
};