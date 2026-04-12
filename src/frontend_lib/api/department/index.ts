// hooks
export { useDepartments, useDepartmentStats, useDepartment } from './queries';
export { useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from './mutations';

// types
export type { Department, DepartmentStats } from './types';
export type { DepartmentListParams } from './api';

// validation (client-side validation before API calls)
// These are SEPARATE from backend schemas to avoid coupling
// See validation.ts for why we use independent frontend schemas
export {
  // Zod schemas (frontend-specific, not shared with backend)
  createDepartmentBodySchema,
  updateDepartmentBodySchema,
  departmentIdParamSchema,
  // Validation helpers
  validateOrThrow,
  validateSafe,
  // Types
  type CreateDepartmentBody,
  type UpdateDepartmentBody,
  type DepartmentIdParam,
} from './validation';