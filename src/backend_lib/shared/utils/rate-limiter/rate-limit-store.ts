/**
 * Rate Limit Store
 * 
 * In-memory store for rate limiting.
 * TODO: Replace with Redis for distributed systems
 */

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// TODO: Replace with Redis for distributed systems
const rateLimitStore = new Map<string, RateLimitStore>();

// Configuration
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
export const RATE_LIMIT_MAX_REQUESTS = 20; // Max requests per window

/**
 * Checks if the request should be rate limited
 */
export function checkRateLimit(clientId: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(clientId);

  // Clean up expired entries when store gets large to avoid unbounded growth
  if (rateLimitStore.size > 1000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    // Create new rate limit record
    const newRecord: RateLimitStore = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    };
    rateLimitStore.set(clientId, newRecord);
    
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetAt: newRecord.resetTime,
    };
  }

  // Increment count
  record.count++;

  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - record.count,
    resetAt: record.resetTime,
  };
}

