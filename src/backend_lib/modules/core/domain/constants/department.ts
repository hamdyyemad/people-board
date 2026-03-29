/**
 * Department domain constants.
 * Single source of truth for rule values and messages used by:
 * - value objects (DepartmentName),
 * - entities (Department),
 * - validation layer (Zod schemas),
 * - and documented for DB migrations (e.g. CHECK constraints).
 */

// ---- Department name (value object) ----
export const DEPARTMENT_NAME = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 150,
} as const;

export const DEPARTMENT_NAME_MESSAGES = {
  REQUIRED: 'name is required',
  EMPTY: 'Department name cannot be less than 2 characters',
  TOO_LONG: `Department name cannot exceed ${DEPARTMENT_NAME.MAX_LENGTH} characters`,
} as const;

// ---- Department entity invariants ----
export const DEPARTMENT_MESSAGES = {
  ID_EMPTY: 'Department ID cannot be empty',
  OWN_PARENT: 'Department cannot be its own parent',
} as const;
