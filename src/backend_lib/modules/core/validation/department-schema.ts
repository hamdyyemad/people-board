import { z } from 'zod';
import { DEPARTMENT_NAME, DEPARTMENT_NAME_MESSAGES } from '../domain/constants/department';
import { basePaginationQuerySchema } from '@/backend_lib/shared/validation';

// ---- Shared ----
const uuidOptional = z
  .union([
    z.string().uuid('parentId must be a valid UUID'),
    z.literal('').transform(() => null),
    z.null(),
  ])
  .optional();

const nameSchema = z
  .string({ required_error: DEPARTMENT_NAME_MESSAGES.REQUIRED })
  .trim()
  .min(DEPARTMENT_NAME.MIN_LENGTH, DEPARTMENT_NAME_MESSAGES.EMPTY)
  .max(DEPARTMENT_NAME.MAX_LENGTH, DEPARTMENT_NAME_MESSAGES.TOO_LONG);

const ALLOWED_DEPT_SORT_FIELDS = ['createdAt', 'name', 'updatedAt', 'parentName'] as const;

/**
 * GET /departments list query. Reuses generic pagination/sort; `sortBy` is whitelisted for
 * repository mapping. Use `uuidOptional` so `parentId=` does not fail validation.
 *
 * `sortBy` accepts comma-separated values (e.g. `name,createdAt`). Each element is validated
 * against the allowed column whitelist.
 */
export const departmentQuerySchema = basePaginationQuerySchema.extend({
  id: uuidOptional,
  parentId: uuidOptional,
  /** Filter field — keep loose for "search"; do not reuse strict `nameSchema` from create body. */
  name: z.string().trim().optional(),
  sortBy: z.string().default('createdAt').transform(v =>
    v.split(',').map(s => s.trim())
  ).refine(
    arr => arr.every(f => (ALLOWED_DEPT_SORT_FIELDS as readonly string[]).includes(f)),
    { message: `sortBy must be one of: ${ALLOWED_DEPT_SORT_FIELDS.join(', ')}` }
  ),
});

export type DepartmentQuery = z.output<typeof departmentQuerySchema>;

// ---- Create ----
export const createDepartmentBodySchema = z.object({
  name: nameSchema,
  parentId: uuidOptional,
});

export type CreateDepartmentBody = z.infer<typeof createDepartmentBodySchema>;

// ---- Update ----
export const updateDepartmentBodySchema = z.object({
  name: nameSchema.optional(),
  parentId: uuidOptional,
});

export type UpdateDepartmentBody = z.infer<typeof updateDepartmentBodySchema>;

// ---- Read (e.g. path/query params) ----
export const departmentIdParamSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
});

export type DepartmentIdParam = z.infer<typeof departmentIdParamSchema>;
