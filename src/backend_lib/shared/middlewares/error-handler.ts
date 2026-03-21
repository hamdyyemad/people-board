/**
 * Global Error Handler Middleware
 *
 * Wraps route handlers to catch errors and return a consistent RFC 7807 response.
 * Uses the framework adapter for request/response (framework-agnostic).
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7807
 */

import type { FrameworkRequest, FrameworkResponse } from '../adapters/current';
import { BaseError } from '../exceptions';
import { createErrorResponse, createErrorResponseFromDetails } from '../http/response';

/**
 * Wraps a route handler with global error handling
 * Supports both static and dynamic routes with full type safety
 */
export function withErrorHandler<P = any>(
  handler: (request: FrameworkRequest, ...rest: any[]) => Promise<FrameworkResponse>
) {
  return async (
    request: FrameworkRequest,
    ...rest: any[]
  ): Promise<FrameworkResponse> => {
    try {
      return await handler(request, ...rest);
    } catch (error) {
      if (error instanceof BaseError) {
        return createErrorResponse(request, error);
      }

      console.error('Unhandled error in route handler:', error);

      // Never send raw error.message to the client (can leak paths, stack, or DB details)
      const isProduction = process.env.NODE_ENV === 'production';
      const safeDetail = isProduction
        ? 'An unexpected error occurred.'
        : (error instanceof Error ? error.message : 'Internal server error');

      return createErrorResponseFromDetails(
        request,
        'https://api.example.com/problems/internal-server-error',
        'Internal Server Error',
        500,
        safeDetail
      );
    }
  };
}
