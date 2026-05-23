import { z } from 'zod';
import { JOB_TITLE, JOB_TITLE_MESSAGES } from '../domain/constants/job';
import { basePaginationQuerySchema } from '@/backend_lib/shared/validation/pagination-schema';

// ---- Shared ----
const uuidRequired = z
  .string({ message: 'id is required' })
  .uuid('id must be a valid UUID');

const uuidOptional = z
.union([
  z.string().uuid('id must be a valid UUID'),
  z.literal('').transform(() => null),
  z.null(),
])
.optional();
  
const titleSchema = z
  .string({ message: JOB_TITLE_MESSAGES.REQUIRED })
  .trim()
  .min(JOB_TITLE.MIN_LENGTH, JOB_TITLE_MESSAGES.EMPTY)
  .max(JOB_TITLE.MAX_LENGTH, JOB_TITLE_MESSAGES.TOO_LONG);

const ALLOWED_JOB_SORT_FIELDS = ['createdAt', 'title', 'updatedAt', 'departmentName'] as const;

/**
 * GET /jobs list query. Reuses generic pagination/sort; `sortBy` is whitelisted for
 * repository mapping. Use `uuidOptional` so `id=` does not fail validation.
 *
 * `sortBy` accepts comma-separated values (e.g. `title,createdAt`). Each element is validated
 * against the allowed column whitelist.
 */
export const jobQuerySchema = basePaginationQuerySchema.extend({
  id: uuidOptional,
  departmentId: uuidOptional,
  /** Filter field — keep loose for "search"; do not reuse strict `titleSchema` from create body. */
  title: z.string().trim().optional(),
  sortBy: z.string().default('createdAt').transform(v =>
    v.split(',').map(s => s.trim())
  ).refine(
    arr => arr.every(f => (ALLOWED_JOB_SORT_FIELDS as readonly string[]).includes(f)),
    { message: `sortBy must be one of: ${ALLOWED_JOB_SORT_FIELDS.join(', ')}` }
  ),
});

export type JobQuery = z.output<typeof jobQuerySchema>;
  
// ---- Create ----
export const createJobBodySchema = z.object({
  title: titleSchema,
  departmentId: uuidRequired,
});

export type CreateJobBody = z.infer<typeof createJobBodySchema>;

// ---- Update ----
export const updateJobBodySchema = z.object({
  id: uuidRequired,
  title: titleSchema.optional(),
  departmentId: z
    .union([
      z.string().uuid('departmentId must be a valid UUID'),
      z.literal('').transform(() => undefined),
      z.undefined(),
    ])
    .optional(),
});

export type UpdateJobBody = z.infer<typeof updateJobBodySchema>;

// ---- Read (e.g. path/query params) ----
export const jobIdParamSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
});

export type JobIdParam = z.infer<typeof jobIdParamSchema>;

export const jobDepartmentParamSchema = z.object({
  departmentId: z.string().uuid('departmentId must be a valid UUID'),
});

export type JobDepartmentParam = z.infer<typeof jobDepartmentParamSchema>;
