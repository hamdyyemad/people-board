/**
 * HTTP Response Helpers
 *
 * Functions for creating consistent, idempotent API responses (success and error).
 * Used by route handlers and middlewares.
 * Framework-agnostic: uses the adapter from shared/adapters/current.
 */

import type { FrameworkRequest, FrameworkResponse } from '../adapters/current';
import { getPath, createJsonResponse } from '../adapters/current';
import type { SuccessResponse, ErrorResponse } from './types';
import { BaseError } from '../exceptions';

/**
 * Creates a success response with consistent structure for idempotency
 *
 * @param request - The framework request object (adapter provides path)
 * @param data - The response data
 * @param status - HTTP status code (default: 200)
 * @returns Formatted success response
 */
export function createSuccessResponse<T>(
  request: FrameworkRequest,
  data: T,
  status: number = 200
): FrameworkResponse {
  const path = getPath(request);

  const response: SuccessResponse<T> = {
    success: true,
    status,
    timestamp: new Date().toISOString(),
    path,
    data,
  };

  return createJsonResponse(response, { status });
}

/**
 * Creates an error response from a BaseError instance
 *
 * @param request - The framework request object
 * @param error - The BaseError instance
 * @param additionalHeaders - Optional additional headers to include
 * @returns Formatted error response (RFC 7807 compliant)
 */
export function createErrorResponse(
  request: FrameworkRequest,
  error: BaseError,
  additionalHeaders?: Record<string, string>
): FrameworkResponse {
  const path = getPath(request);

  const errorResponse: ErrorResponse = {
    success: false,
    type: error.type,
    title: error.title,
    status: error.statusCode,
    timestamp: error.timestamp,
    path,
    detail: error.message,
    instance: path,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/problem+json',
    ...additionalHeaders,
  };

  return createJsonResponse(errorResponse, {
    status: error.statusCode,
    headers,
  });
}

/**
 * Creates an error response from error details
 *
 * @param request - The framework request object
 * @param type - Problem type URI
 * @param title - Problem title
 * @param status - HTTP status code
 * @param detail - Error detail message
 * @param additionalHeaders - Optional additional headers to include
 * @returns Formatted error response (RFC 7807 compliant)
 */
export function createErrorResponseFromDetails(
  request: FrameworkRequest,
  type: string,
  title: string,
  status: number,
  detail: string,
  additionalHeaders?: Record<string, string>
): FrameworkResponse {
  const path = getPath(request);

  const errorResponse: ErrorResponse = {
    success: false,
    type,
    title,
    status,
    timestamp: new Date().toISOString(),
    path,
    detail,
    instance: path,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/problem+json',
    ...additionalHeaders,
  };

  return createJsonResponse(errorResponse, {
    status,
    headers,
  });
}
