/**
 * Authentication Middleware
 *
 * TODO: Implement authentication logic (JWT, session, API key).
 * Uses framework adapter types (framework-agnostic).
 */

import type { FrameworkRequest, FrameworkResponse } from '../adapters/current';

/**
 * Authentication middleware wrapper
 * TODO: Implement actual authentication logic
 */
export function withAuthentication(
  handler: (request: FrameworkRequest) => Promise<FrameworkResponse>
) {
  return async (
    request: FrameworkRequest
  ): Promise<FrameworkResponse> => {
    // TODO: Implement authentication
    return handler(request);
  };
}
