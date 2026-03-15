/**
 * Client Identifier Utilities
 *
 * Identifies clients for rate limiting using the framework adapter (no direct next js server dependency).
 */

import type { FrameworkRequest } from '../../adapters/current';
import { getHeader } from '../../adapters/current';

/**
 * Gets the client identifier for rate limiting
 *
 * @param request - The framework request object
 * @returns Client identifier (IP address or 'unknown')
 */
export function getClientId(request: FrameworkRequest): string {
  const forwarded = getHeader(request, 'x-forwarded-for');
  const realIp = getHeader(request, 'x-real-ip');
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown';

  return ip;
}
