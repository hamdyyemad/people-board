// hooks
import { useGenericQuery } from '../config';
import { fetchDepartmentById, fetchDepartments, fetchDepartmentStats } from './api';

/*************** Query hooks to fetch department data ***************/

/**
 * Fetch all departments
 * Error handling: Component should check isError state and display error UI
 */
export const useDepartments = () => {
  return useGenericQuery(['departments'], fetchDepartments);
};

/**
 * Fetch department statistics
 * Error handling: Component should check isError state
 */
export const useDepartmentStats = () => {
  return useGenericQuery(['departments', 'stats'], fetchDepartmentStats);
};

/**
 * Fetch a single department by ID
 * Error handling: Component should check isError state
 * 404 errors are expected if department doesn't exist
 */
export const useDepartment = (id: string) => {
  return useGenericQuery(
    ['departments', id],
    () => fetchDepartmentById(id),
    { enabled: !!id } // Only fetch if ID is provided
  );
};