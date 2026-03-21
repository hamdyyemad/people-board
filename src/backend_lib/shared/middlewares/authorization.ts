/**
 * Authorization Middleware
 *
 * TODO: Implement authorization logic (permissions, RBAC).
 * Uses framework adapter types (framework-agnostic).
 */

import type { FrameworkRequest, FrameworkResponse } from '../adapters/current';

/**
 * Authorization middleware wrapper
 * Supports both static and dynamic routes with full type safety
 * TODO: Implement actual authorization logic
 */
export function withAuthorization<P = any>(
  handler: (request: FrameworkRequest, ...rest: any[]) => Promise<FrameworkResponse>
) {
  return async (
    request: FrameworkRequest,
    ...rest: any[]
  ): Promise<FrameworkResponse> => {
    // TODO: Implement authorization
    return handler(request, ...rest);
  };
}
