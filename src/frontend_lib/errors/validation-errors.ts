/**
 * Validation Error Handling
 *
 * Handles client-side and server-side validation errors.
 * Provides structured error types for form validation and data validation.
 */

// ─────────────────────────────────────────────────────────────────────────
// Validation Error Types
// ─────────────────────────────────────────────────────────────────────────

/**
 * Field-level validation error
 */
export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Multiple field validation errors
 */
export interface ValidationErrors {
  [field: string]: string | string[];
}

// ─────────────────────────────────────────────────────────────────────────
// Validation Error Classes
// ─────────────────────────────────────────────────────────────────────────

/**
 * Error class for validation failures
 * Used for both client-side and server-side validation errors
 */
export class ValidationError extends Error {
  public readonly errors: ValidationErrors;
  public readonly fieldErrors: FieldError[];

  constructor(message: string, errors: ValidationErrors | FieldError[]) {
    super(message);
    this.name = "ValidationError";
    
    // Convert field errors array to errors object if needed
    if (Array.isArray(errors)) {
      this.fieldErrors = errors;
      this.errors = errors.reduce((acc, err) => {
        acc[err.field] = err.message;
        return acc;
      }, {} as ValidationErrors);
    } else {
      this.errors = errors;
      this.fieldErrors = Object.entries(errors).map(([field, message]) => ({
        field,
        message: Array.isArray(message) ? message.join(", ") : message,
      }));
    }
    
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Get error message for a specific field
   */
  getFieldError(field: string): string | undefined {
    const error = this.errors[field];
    return Array.isArray(error) ? error.join(", ") : error;
  }

  /**
   * Check if a specific field has an error
   */
  hasFieldError(field: string): boolean {
    return field in this.errors;
  }

  /**
   * Get all field names that have errors
   */
  getErrorFields(): string[] {
    return Object.keys(this.errors);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Validation Helpers
// ─────────────────────────────────────────────────────────────────────────

/**
 * Parse validation errors from API response
 * Converts various error formats into a consistent ValidationError
 *
 * @param responseData - The error response from the API
 * @returns ValidationError instance
 *
 * @example
 * catch (error) {
 *   if (error.statusCode === 422) {
 *     const validationError = parseValidationErrors(error.details);
 *     // Show field-specific errors in form
 *   }
 * }
 */
export function parseValidationErrors(responseData: any): ValidationError {
  // Handle different API validation error formats
  
  // Format 1: { errors: { field: "message" } }
  if (responseData.errors && typeof responseData.errors === "object") {
    return new ValidationError(
      responseData.message || "Validation failed",
      responseData.errors
    );
  }
  
  // Format 2: { fields: [{ field: "name", message: "Required" }] }
  if (responseData.fields && Array.isArray(responseData.fields)) {
    return new ValidationError(
      responseData.message || "Validation failed",
      responseData.fields
    );
  }
  
  // Format 3: Array of field errors
  if (Array.isArray(responseData)) {
    return new ValidationError("Validation failed", responseData);
  }
  
  // Fallback: generic validation error
  return new ValidationError(
    responseData.message || responseData.detail || "Validation failed",
    {}
  );
}

/**
 * Global validation error callback
 * Similar to API errors, but for validation-specific handling
 * @internal
 */
let validationErrorCallback: ((error: ValidationError) => void) | null = null;

/**
 * Sets the global validation error handler
 * Called once at app startup
 *
 * @param callback - Function to call when a ValidationError occurs
 *
 * @example
 * setGlobalValidationErrorHandler((error: ValidationError) => {
 *   // Show validation errors in a notification or form
 *   error.fieldErrors.forEach(({ field, message }) => {
 *     console.error(`${field}: ${message}`);
 *   });
 * });
 */
export function setGlobalValidationErrorHandler(
  callback: (error: ValidationError) => void
) {
  console.log("Setting global validation error handler");
  validationErrorCallback = callback;
}

/**
 * Notifies the global validation error handler
 * Called when validation errors occur
 *
 * @param error - The validation error to notify about
 *
 * @example
 * catch (error) {
 *   if (error instanceof ValidationError) {
 *     notifyValidationError(error);
 *   }
 * }
 */
export function notifyValidationError(error: ValidationError) {
  console.log("notifyValidationError called with:", error);
  
  if (validationErrorCallback) {
    console.log("Triggering validationErrorCallback");
    validationErrorCallback(error);
  } else {
    console.warn("validationErrorCallback not set!");
  }
}
