/**
 * Department API Functions
 * 
 * IMPORTANT: Why handleResponse() is called immediately after fetch()
 * -------------------------------------------------------------------
 * Network errors (DNS failures, no internet) are caught by try/catch, but
 * HTTP errors (400, 404, 500, etc.) DO NOT throw - fetch() still succeeds!
 * 
 * The Response object won't tell you there's an error until you check res.ok.
 * That's why we call handleResponse(res) IMMEDIATELY after getting the response,
 * before trying to parse JSON or return data.
 * 
 * Example WITHOUT handleResponse (manual error handling):
 * 
 * export async function fetchUser(id: string) {
 *   try {
 *     const res = await fetch(`/api/users/${id}`);
 *     
 *     // ❌ ERROR: res.ok is false, but we didn't check!
 *     // Calling res.json() will parse the error response as if it's valid data
 *     
 *     if (!res.ok) {
 *       const error = await res.json();
 *       
 *       // Manually trigger error notification
 *       notifyError(new ApiError({
 *         title: error.title || "Failed to load user",
 *         status: res.status,
 *         detail: error.detail || "Please try again",
 *       }));
 *       
 *       throw new ApiError({ ...error, status: res.status });
 *     }
 *     
 *     return res.json();
 *   } catch (err) {
 *     // Handle network errors
 *     notifyError(new ApiError({
 *       title: "Network error",
 *       status: 0,
 *       detail: "Connection failed",
 *     }));
 *     throw err;
 *   }
 * }
 * 
 * With handleResponse, all of this is handled automatically:
 * - Checks res.ok
 * - Parses RFC 7807 error responses
 * - Throws properly typed ApiError
 * - Provides consistent error handling across all API calls
 * 
 * NOTE: Client-side validation
 * ----------------------------
 * These API functions AUTOMATICALLY validate payloads before making API calls.
 * Validation happens at TWO layers:
 * 
 * 1. **API Layer (this file)** - Validates before fetch() is called
 *    - Prevents invalid data from being sent to server
 *    - Throws ValidationError immediately if data is invalid
 *    - Automatic safety net for all API calls
 * 
 * 2. **Form Layer (optional but recommended)** - Validate as user types
 *    - Better UX with immediate feedback
 *    - Show field-specific errors in real-time
 *    - Prevent invalid form submissions
 * 
 * Frontend validation schemas are SEPARATE from backend schemas to avoid
 * coupling. This ensures the frontend won't break when migrating to Nest.js.
 * 
 * See validation.ts for frontend Zod schemas and validation helpers.
 * See VALIDATION.md for architecture decision and rationale.
 * 
 * @example
 * import { createDepartmentBodySchema, validateOrThrow } from './validation';
 * 
 * // OPTION 1: Let API layer validate automatically
 * try {
 *   await createDepartment(formData); // API layer validates before fetch
 * } catch (error) {
 *   // ValidationError or ApiError thrown automatically
 * }
 * 
 * // OPTION 2: Validate in form first for better UX (recommended)
 * try {
 *   // Form validation (immediate feedback as user types)
 *   const validated = validateOrThrow(createDepartmentBodySchema, formData);
 *   
 *   // API call (validates again as safety net)
 *   await createDepartment(validated);
 * } catch (error) {
 *   // Handle validation or API errors
 * }
 */

// types
import { Department, DepartmentStats } from './types';
import { handleResponse } from '../config';
import {
  createDepartmentBodySchema,
  updateDepartmentBodySchema,
  departmentIdParamSchema,
  validateOrThrow,
} from './validation';
import { Pagination } from '@/frontend_lib/types';
import { buildListSearchParams, type ListParams } from '../params';

/**
 * Department-specific list query params.
 * Extends the generic {@link ListParams} with department filters.
 * `sortBy` is narrowed to the columns the backend whitelists.
 */
export interface DepartmentListParams extends ListParams {
  sortBy?: 'createdAt' | 'name' | 'updatedAt';
  /** Filter by parent department UUID. Pass empty string or undefined to skip. */
  parentId?: string;
  /** Partial name search (case-insensitive). */
  name?: string;
}

/*************** Queries ***************/
export const fetchDepartments = async (
  params: DepartmentListParams = {}
): Promise<Pagination<Department>> => {
  const search = buildListSearchParams(params);
  const res = await fetch(`/api/v1/departments?${search}`);
  // ✅ handleResponse checks res.ok immediately, before parsing JSON
  // If res.ok is false (HTTP error), it parses the error and throws ApiError
  // If res.ok is true, it safely parses and returns the data
  const data = await handleResponse<{ data: Pagination<Department> }>(res);
  return data.data;
};

export const fetchDepartmentStats = async (): Promise<DepartmentStats> => {
  const res = await fetch('/api/v1/departments/stats');
  // ✅ Same pattern: check for errors before parsing
  const data = await handleResponse<{ data: DepartmentStats }>(res);
  return data.data;
};

export const fetchDepartmentById = async (id: string): Promise<Department | undefined> => {
  // ✅ Validate ID is a valid UUID before making request
  validateOrThrow(departmentIdParamSchema, { id });
  
  const res = await fetch(`/api/v1/departments/${id}`);
  // ✅ Handles 404 Not Found by throwing ApiError with proper details
  const data = await handleResponse<{ data: Department }>(res);
  return data.data;
};


/*************** Mutations ***************/
export const createDepartment = async (payload: Partial<Department>): Promise<Department> => {
  // ✅ LAYER 1: Client-side validation (before API call)
  // Validates payload structure and throws ValidationError if invalid
  // This prevents sending invalid data to the server
  const validated = validateOrThrow(createDepartmentBodySchema, payload);
  
  const res = await fetch('/api/v1/departments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validated), // Send validated data
  });
  
  // ✅ LAYER 2: Check HTTP response status (after API call)
  // Handles 409 Conflict (duplicate), 422 Validation errors from server, etc.
  const data = await handleResponse<{ data: Department }>(res);
  return data.data;
};

export const updateDepartment = async (id: string, payload: Partial<Department>): Promise<Department> => {
  // ✅ LAYER 1: Client-side validation (before API call)
  // Validate ID is a valid UUID
  validateOrThrow(departmentIdParamSchema, { id });
  // Validate payload structure
  const validated = validateOrThrow(updateDepartmentBodySchema, payload);
  
  const res = await fetch(`/api/v1/departments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validated), // Send validated data
  });
  
  // ✅ LAYER 2: Check HTTP response status (after API call)
  // Handles 404 Not Found, 403 Forbidden, 422 validation errors, etc.
  const data = await handleResponse<{ data: Department }>(res);
  return data.data;
};

export const deleteDepartment = async (id: string): Promise<Department> => {
  // ✅ Validate ID is a valid UUID before making request
  validateOrThrow(departmentIdParamSchema, { id });
  
  const res = await fetch(`/api/v1/departments/${id}`, {
    method: 'DELETE',
  });
  // ✅ Handles 404 Not Found, 409 Conflict (e.g., has dependencies), etc.
  const data = await handleResponse<{ data: Department }>(res);
  return data.data;
};