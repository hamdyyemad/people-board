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
 */

// types
import { Department, DepartmentStats } from './types';
import { handleResponse } from '../config';

/*************** Queries ***************/
export const fetchDepartments = async (): Promise<Department[]> => {
  const res = await fetch('/api/v1/departments');
  // ✅ handleResponse checks res.ok immediately, before parsing JSON
  // If res.ok is false (HTTP error), it parses the error and throws ApiError
  // If res.ok is true, it safely parses and returns the data
  const data = await handleResponse<{ data: Department[] }>(res);
  return data.data;
};

export const fetchDepartmentStats = async (): Promise<DepartmentStats> => {
  const res = await fetch('/api/v1/departments/stats');
  // ✅ Same pattern: check for errors before parsing
  const data = await handleResponse<{ data: DepartmentStats }>(res);
  return data.data;
};

export const fetchDepartmentById = async (id: string): Promise<Department | undefined> => {
  const res = await fetch(`/api/v1/departments/${id}`);
  // ✅ Handles 404 Not Found by throwing ApiError with proper details
  const data = await handleResponse<{ data: Department }>(res);
  return data.data;
};


/*************** Mutations ***************/
export const createDepartment = async (payload: Partial<Department>): Promise<Department> => {
  const res = await fetch('/api/v1/departments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  // ✅ Critical: Check for 409 Conflict (duplicate) or 422 Validation errors
  // before trying to parse response as successful data
  const data = await handleResponse<{ data: Department }>(res);
  return data.data;
};

export const updateDepartment = async (id: string, payload: Partial<Department>): Promise<Department> => {
  const res = await fetch(`/api/v1/departments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  // ✅ Handles 404 Not Found, 403 Forbidden, validation errors, etc.
  const data = await handleResponse<{ data: Department }>(res);
  return data.data;
};

export const deleteDepartment = async (id: string): Promise<Department> => {
  const res = await fetch(`/api/v1/departments/${id}`, {
    method: 'DELETE',
  });
  // ✅ Handles 404 Not Found, 409 Conflict (e.g., has dependencies), etc.
  const data = await handleResponse<{ data: Department }>(res);
  return data.data;
};