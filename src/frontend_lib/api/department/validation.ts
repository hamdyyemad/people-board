/**
 * Department Validation - Frontend Schemas
 * 
 * IMPORTANT: Why separate schemas instead of importing from backend?
 * ------------------------------------------------------------------
 * These schemas are INTENTIONALLY separate from backend validation to:
 * 
 * 1. **Avoid coupling** - Frontend doesn't depend on backend code structure
 * 2. **Future-proof** - When migrating to Nest.js, these schemas won't break
 * 3. **Independent deployment** - Frontend can be developed/deployed separately
 * 4. **Flexible validation** - Can be more lenient for UX (e.g., validate as user types)
 * 
 * These schemas should MATCH the backend validation rules, but they are
 * defined independently. If backend validation changes, update these manually.
 * 
 * Backend reference: backend_lib/modules/core/validation/department-schema.ts
 */

import { z } from 'zod';
import { uuidOptional, uuidRequired } from '@/frontend_lib/validation/zod';

// Re-export general validation utilities
export { validateOrThrow, validateSafe, validateField } from '@/frontend_lib/validation/zod';

// ============================================================================
// Department-Specific Validation Schemas
// ============================================================================

/**
 * Department name validation
 * Rules match backend: 2-100 characters, trimmed
 * Backend reference: DEPARTMENT_NAME.MIN_LENGTH = 1, MAX_LENGTH = 100
 */
const nameSchema = z
  .string({ message: 'Department name is required' })
  .min(2, 'Department name must be at least 2 characters')
  .max(100, 'Department name must be 100 characters or less')
  .trim();

/**
 * Parent ID validation (department-specific)
 * Accepts: valid UUID, empty string (converted to null), or null
 */
const parentIdSchema = z
  .union([
    z.string().uuid('Parent department must be a valid UUID'),
    z.literal('').transform(() => null),
    z.null(),
  ])
  .optional();

/**
 * Create Department Schema
 * Used for client-side validation when creating a new department
 */
export const createDepartmentBodySchema = z.object({
  name: nameSchema,
  parentId: parentIdSchema,
});

export type CreateDepartmentBody = z.infer<typeof createDepartmentBodySchema>;

/**
 * Update Department Schema
 * Used for client-side validation when updating a department
 */
export const updateDepartmentBodySchema = z.object({
  name: nameSchema.optional(),
  parentId: parentIdSchema,
});

export type UpdateDepartmentBody = z.infer<typeof updateDepartmentBodySchema>;

/**
 * Department ID Parameter Schema
 * Used for validating URL parameters
 */
export const departmentIdParamSchema = z.object({
  id: z.string().uuid('Department ID must be a valid UUID'),
});

export type DepartmentIdParam = z.infer<typeof departmentIdParamSchema>;
