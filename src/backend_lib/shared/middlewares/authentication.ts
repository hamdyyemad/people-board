/**
 * Authentication Middleware
 *
 * TODO: Implement authentication logic (JWT, session, API key).
 * Uses framework adapter types (framework-agnostic).
 */

import type { FrameworkRequest, FrameworkResponse } from '../adapters/current';

/**
 * Authentication middleware wrapper
 * Supports both static and dynamic routes with full type safety
 * TODO: Implement actual authentication logic
 */
export function withAuthentication<P = any>(
  handler: (request: FrameworkRequest, ...rest: any[]) => Promise<FrameworkResponse>
) {
  return async (
    request: FrameworkRequest,
    ...rest: any[]
  ): Promise<FrameworkResponse> => {
    // TODO: Implement authentication
    return handler(request, ...rest);
  };
}
