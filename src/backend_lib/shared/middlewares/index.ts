/**
 * Middleware System
 *
 * Composes middlewares for route handlers. Uses the framework adapter
 * (shared/adapters/current) so that switching to NestJS only requires
 * changing the adapter—no edits here.
 *
 * Order: Error Handler → Rate Limit → Authentication → Authorization → Handler
 */

import type { FrameworkRequest, FrameworkResponse } from '../adapters/current';
import { withRateLimit } from './rate-limiter';
import { withAuthentication } from './authentication';
import { withAuthorization } from './authorization';
import { withErrorHandler } from './error-handler';
function compose(
  ...middlewares: Array<
    (
      handler: (request: FrameworkRequest) => Promise<FrameworkResponse>
    ) => (request: FrameworkRequest) => Promise<FrameworkResponse>
  >
) {
  return (handler: (request: FrameworkRequest) => Promise<FrameworkResponse>) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}

/**
 * Applies all middlewares to a route handler.
 * Execution order (outer to inner): Error Handler → Rate Limit → Auth → Authorization → Handler.
 */
export function withMiddlewares(
  handler: (request: FrameworkRequest) => Promise<FrameworkResponse>
) {
  return compose(
    withErrorHandler,
    withRateLimit,
    withAuthentication,
    withAuthorization
  )(handler);
}

export { withErrorHandler } from './error-handler';
export { withRateLimit } from './rate-limiter';
export { withAuthentication } from './authentication';
export { withAuthorization } from './authorization';
