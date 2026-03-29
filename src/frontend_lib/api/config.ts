import { 
  DefaultOptions, 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  QueryKey,
} from "@tanstack/react-query";

// Re-export error handling from errors module
import { ApiError, triggerError } from "../errors/api-errors";
export {
  // Types
  type ProblemDetails,
  // Classes
  ApiError,
  // Functions
  handleResponse,
  setGlobalErrorHandler,
  triggerError,
} from "../errors/api-errors";

// ─────────────────────────────────────────────────────────────────────────
// React Query Configuration
// ─────────────────────────────────────────────────────────────────────────

/**
 * React Query default configuration
 * Applied to all queries and mutations globally
 */
export const queryClientConfig: DefaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  mutations: {
    retry: 0, // Don't retry mutations - they modify data and shouldn't be retried on errors (especially client errors like 409, 400, etc.)
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Generic Reusable Query Hook
// ─────────────────────────────────────────────────────────────────────────

/**
 * Smart retry strategy for queries
 * - Don't retry client errors (400-499) - they won't fix themselves
 * - Retry server errors (500+) and network errors up to 2 times
 */
const smartRetry = (failureCount: number, error: unknown): boolean => {
  // Don't retry on client errors (400-499)
  if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
    return false;
  }
  // Retry server errors up to 2 times
  return failureCount < 2;
};

/**
 * Generic query hook with smart retry logic
 * 
 * @param queryKey - React Query cache key
 * @param queryFn - Function that fetches data
 * @param options - Additional React Query options
 * 
 * @example
 * export const useDepartments = () => {
 *   return useGenericQuery(['departments'], fetchDepartments);
 * };
 * 
 * @example With options
 * export const useDepartment = (id: string) => {
 *   return useGenericQuery(
 *     ['departments', id],
 *     () => fetchDepartmentById(id),
 *     { enabled: !!id }
 *   );
 * };
 */
export function useGenericQuery<TData = unknown>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, unknown, TData, QueryKey>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn,
    retry: smartRetry,
    ...options,
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Generic Reusable Mutation Hook
// ─────────────────────────────────────────────────────────────────────────

/**
 * Options for generic mutation hook
 */
export interface GenericMutationOptions<TData, TVariables> {
  /** Function that performs the mutation */
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Query keys to invalidate on success (auto-refreshes data) */
  invalidateKeys?: QueryKey[];
  /** Custom success callback (runs before invalidation) */
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  /** Custom error callback (runs before global error handler) */
  onError?: (error: unknown, variables: TVariables) => void;
  /** Whether to show error toast (default: true) */
  showErrorToast?: boolean;
}

/**
 * Generic mutation hook with error handling and cache invalidation
 * 
 * @param options - Configuration object
 * 
 * @example Create operation
 * export const useCreateDepartment = () => {
 *   return useGenericMutation({
 *     mutationFn: createDepartment,
 *     invalidateKeys: [['departments'], ['departments', 'stats']],
 *   });
 * };
 * 
 * @example Update operation with custom success callback
 * export const useUpdateDepartment = () => {
 *   return useGenericMutation({
 *     mutationFn: ({ id, data }) => updateDepartment(id, data),
 *     invalidateKeys: [['departments'], ['departments', id]],
 *     onSuccess: (data) => console.log('Updated:', data),
 *   });
 * };
 * 
 * @example Delete operation without error toast
 * export const useDeleteDepartment = () => {
 *   return useGenericMutation({
 *     mutationFn: deleteDepartment,
 *     invalidateKeys: [['departments']],
 *     showErrorToast: false,
 *   });
 * };
 */
export function useGenericMutation<TData = unknown, TVariables = unknown>(
  options: GenericMutationOptions<TData, TVariables>
) {
  const queryClient = useQueryClient();
  const { 
    mutationFn, 
    invalidateKeys = [], 
    onSuccess, 
    onError,
    showErrorToast = true 
  } = options;

  return useMutation({
    mutationFn,
    onSuccess: async (data, variables, context) => {
      // Run custom success callback first
      if (onSuccess) {
        await onSuccess(data, variables);
      }

      // Invalidate all specified query keys to refresh data
      for (const queryKey of invalidateKeys) {
        await queryClient.invalidateQueries({ queryKey });
      }
    },
    onError: (error: unknown, variables, context) => {
      // Run custom error callback first
      if (onError) {
        onError(error, variables);
      }

      // Show error toast unless disabled
      if (showErrorToast) {
        if (error instanceof ApiError) {
          triggerError(error);
        } else {
          // Fallback for unexpected error types
          triggerError(new ApiError({
            title: "Error",
            status: 500,
            detail: error instanceof Error ? error.message : String(error),
          }));
        }
      }
    },
  });
}
