import { z } from 'zod';
import { JOB_TITLE, JOB_TITLE_MESSAGES } from '../domain/constants/job';

// ---- Shared ----
const uuidRequired = z
  .string({ required_error: 'departmentId is required' })
  .uuid('departmentId must be a valid UUID');

const titleSchema = z
  .string({ required_error: JOB_TITLE_MESSAGES.REQUIRED })
  .trim()
  .min(JOB_TITLE.MIN_LENGTH, JOB_TITLE_MESSAGES.EMPTY)
  .max(JOB_TITLE.MAX_LENGTH, JOB_TITLE_MESSAGES.TOO_LONG);

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
