/**
 * Error Response Types (RFC 7807)
 *
 * Type definitions for RFC 7807 Problem Details for HTTP APIs.
 * For API responses that extend BaseApiResponse, use ErrorResponse from api-response.ts
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7807
 */

/**
 * RFC 7807 Problem Details for HTTP APIs (base structure)
 */
export interface ProblemDetails {
  /**
   * A URI reference that identifies the problem type
   * Example: "https://api.example.com/problems/validation-error"
   */
  type: string;

  /**
   * A short, human-readable summary of the problem type
   * Example: "Validation Error"
   */
  title: string;

  /**
   * The HTTP status code
   */
  status: number;

  /**
   * A human-readable explanation specific to this occurrence of the problem
   */
  detail: string;

  /**
   * A URI reference that identifies the specific occurrence of the problem
   * Example: "/api/v1/crypto/price?symbol=INVALID"
   */
  instance?: string;
}
