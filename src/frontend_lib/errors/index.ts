/**
 * Error Handling System
 * 
 * Central exports for all error handling utilities:
 * - API errors (RFC 7807 compliant)
 * - Validation errors (form and data validation)
 */

// API Errors
export {
  type ProblemDetails,
  ApiError,
  handleResponse,
  setGlobalErrorHandler,
  triggerError,
} from "./api-errors";

// Validation Errors
export {
  type FieldError,
  type ValidationErrors,
  ValidationError,
  parseValidationErrors,
  setGlobalValidationErrorHandler,
  triggerValidationError,
} from "./validation-errors";
