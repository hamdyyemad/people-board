/**
 * Job domain constants.
 * Single source of truth for rule values and messages used by:
 * - value objects (JobName),
 * - entities (Job),
 * - validation layer (Zod schemas),
 * - and documented for DB migrations (e.g. CHECK constraints).
 */

// ---- Job name (value object) ----
export const JOB_TITLE = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 255,
} as const;

export const JOB_TITLE_MESSAGES = {
  REQUIRED: 'title is required',
  EMPTY: 'Job title cannot be empty',
  TOO_LONG: `Job title cannot exceed ${JOB_TITLE.MAX_LENGTH} characters`,
} as const;

// ---- Job entity invariants ----
export const JOB_MESSAGES = {
  ID_EMPTY: 'Job ID cannot be empty',
  DEPARTMENT_ID_EMPTY: 'Job department ID cannot be empty',
} as const;
