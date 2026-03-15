import { z } from 'zod';
import { DEPARTMENT_NAME, DEPARTMENT_NAME_MESSAGES } from '../domain/constants/department';

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
  .min(DEPARTMENT_NAME.MIN_LENGTH, DEPARTMENT_NAME_MESSAGES.EMPTY)
  .max(DEPARTMENT_NAME.MAX_LENGTH, DEPARTMENT_NAME_MESSAGES.TOO_LONG)
  .trim();

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
