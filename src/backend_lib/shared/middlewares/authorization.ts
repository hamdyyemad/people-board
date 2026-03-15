/**
 * Authorization Middleware
 *
 * TODO: Implement authorization logic (permissions, RBAC).
 * Uses framework adapter types (framework-agnostic).
 */

import type { FrameworkRequest, FrameworkResponse } from '../adapters/current';

/**
 * Authorization middleware wrapper
 * TODO: Implement actual authorization logic
 */
export function withAuthorization(
  handler: (request: FrameworkRequest) => Promise<FrameworkResponse>
) {
  return async (
    request: FrameworkRequest
  ): Promise<FrameworkResponse> => {
    // TODO: Implement authorization
    return handler(request);
  };
}
