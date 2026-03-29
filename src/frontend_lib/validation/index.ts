/**
 * Frontend Validation Utilities
 * 
 * General-purpose validation helpers and schema components.
 * Import from here for consistent validation across all API modules.
 */

// Validation utilities
export {
  validateOrThrow,
  validateSafe,
  validateField,
} from './zod';

// Common schema helpers
export {
  uuidOptional,
  uuidRequired,
  emailSchema,
  passwordSchema,
  urlSchema,
  phoneSchema,
} from './zod';
