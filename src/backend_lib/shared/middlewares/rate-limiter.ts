/**
 * Rate Limiting Middleware
 *
 * Uses the framework adapter and rate limiter utils (framework-agnostic).
 */

import type { FrameworkRequest, FrameworkResponse } from '../adapters/current';
import { setResponseHeader } from '../adapters/current';
import { getClientId, checkRateLimit, RATE_LIMIT_MAX_REQUESTS } from '../utils/rate-limiter';
import { createErrorResponseFromDetails } from '../http/response';

/**
 * Rate limiting middleware wrapper
 */
export function withRateLimit(
  handler: (request: FrameworkRequest) => Promise<FrameworkResponse>
) {
  return async (
    request: FrameworkRequest
  ): Promise<FrameworkResponse> => {
    const clientId = getClientId(request);
    const rateLimit = checkRateLimit(clientId);

    if (!rateLimit.allowed) {
      return createErrorResponseFromDetails(
        request,
        'https://api.example.com/problems/rate-limit-exceeded',
        'Rate Limit Exceeded',
        429,
        'Rate limit exceeded. Please try again later.',
        {
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetAt / 1000)),
          'Retry-After': String(
            Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
          ),
        }
      );
    }

    const response = await handler(request);
    setResponseHeader(response, 'X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS));
    setResponseHeader(response, 'X-RateLimit-Remaining', String(rateLimit.remaining));
    setResponseHeader(response, 'X-RateLimit-Reset', String(Math.ceil(rateLimit.resetAt / 1000)));

    return response;
  };
}
