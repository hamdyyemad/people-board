  /**
 * Middleware System
 *
 * Composes middlewares for route handlers. Uses the framework adapter
 * (shared/adapters/current) so that switching to NestJS only requires
 * changing the adapter—no edits here.
 *
 * Order: Error Handler → Rate Limit → Authentication → Authorization → Handler 
 *
 * ## Dynamic Route Parameters Support
 *
 * This middleware now supports both:
 * - Static routes: handler(request) → (request) => Promise<Response>
 * - Dynamic routes: handler(request, { params }) → (request, context) => Promise<Response>
 *
 * The middleware detects the handler's arity (number of parameters) and passes
 * the appropriate arguments. This allows route handlers with dynamic segments
 * (e.g., [id], [userId]) to receive the params context without coupling the
 * middleware to Next.js specifics.
 */

import type { FrameworkRequest, FrameworkResponse } from '../adapters/current';
import { withRateLimit } from './rate-limiter';
import { withAuthentication } from './authentication';
import { withAuthorization } from './authorization';
import { withErrorHandler } from './error-handler';

// Handler types - properly typed for security and IntelliSense
type StaticRouteHandler = (request: FrameworkRequest) => Promise<FrameworkResponse>;
type DynamicRouteHandler<P = any> = (
  request: FrameworkRequest,
  context: { params: Promise<P> }
) => Promise<FrameworkResponse>;
type RouteHandler<P = any> = StaticRouteHandler | DynamicRouteHandler<P>;

// Middleware type
type Middleware = <P = any>(handler: RouteHandler<P>) => RouteHandler<P>;

function compose(...middlewares: Middleware[]) {
  return <P = any>(handler: RouteHandler<P>): RouteHandler<P> => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}

/**
 * Applies all middlewares to a route handler.
 * Supports both static routes (request only) and dynamic routes (request + context).
 * Execution order (outer to inner): Error Handler → Rate Limit → Auth → Authorization → Handler.
 * 
 * Type-safe: Preserves exact handler signature for compile-time safety.
 * 
 * @example
 * // Static route
 * export const GET = withMiddlewares(async (request) => { ... });
 * 
 * // Dynamic route (Next.js 15+)
 * export const GET = withMiddlewares(async (request, { params }: { params: Promise<{ id: string }> }) => { ... });
 */
export function withMiddlewares<P = any>(handler: RouteHandler<P>): RouteHandler<P> {
  return compose(
    withErrorHandler as Middleware,
    withRateLimit as Middleware,
    withAuthentication as Middleware,
    withAuthorization as Middleware
  )(handler) as RouteHandler<P>;
}

export { withErrorHandler } from './error-handler';
export { withRateLimit } from './rate-limiter';
export { withAuthentication } from './authentication';
export { withAuthorization } from './authorization';
