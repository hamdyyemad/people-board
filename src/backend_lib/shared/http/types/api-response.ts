/**
 * API Response Types
 *
 * Base response types for all API endpoints to ensure idempotency
 * and consistent response structure (HTTP layer).
 */

/**
 * Base API Response structure
 * Ensures all responses follow a consistent format for idempotency
 */
export interface BaseApiResponse {
  /**
   * HTTP status code
   */
  status: number;

  /**
   * Timestamp of the response
   */
  timestamp: string;

  /**
   * Request path and query string (for idempotency tracking)
   */
  path: string;
}

/**
 * Success Response wrapper
 */
export interface SuccessResponse<T> extends BaseApiResponse {
  success: true;
  data: T;
}

/**
 * Error Response (RFC 7807 compliant)
 */
export interface ErrorResponse extends BaseApiResponse {
  success: false;
  type: string;
  title: string;
  detail: string;
  instance?: string;
}
