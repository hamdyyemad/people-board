// hooks
import { useGenericQuery, usePaginatedQuery } from '../config';
import {
  fetchDepartmentById,
  fetchDepartments,
  fetchDepartmentStats,
  type DepartmentListParams,
} from './api';

/*************** Query hooks to fetch department data ***************/

/**
 * Paginated department list.
 *
 * Pass a memoised `params` object (e.g. from `useMemo`) so the query key stays
 * stable across renders and React Query only refetches when a param actually changes.
 *
 * @example
 * const params = useMemo(() => ({ limit: 20, cursor, sortBy: 'name' }), [cursor]);
 * const { data, isLoading } = useDepartments(params);
 * const { data: departments, pagination } = data ?? {};
 */
export const useDepartments = (params: DepartmentListParams = {}) =>
  usePaginatedQuery(['departments'], fetchDepartments, params);

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