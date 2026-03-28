"use client";

import { ReactNode, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { 
  setGlobalErrorHandler, 
  ApiError 
} from "@/frontend_lib/errors/api-errors";
import { 
  setGlobalValidationErrorHandler, 
  ValidationError 
} from "@/frontend_lib/errors/validation-errors";

/**
 * Generic Error Provider
 * 
 * Handles all types of errors globally:
 * - API errors (HTTP/RFC 7807)
 * - Validation errors (form/data validation)
 * - Future error types can be added here
 * 
 * Sets up error handlers at module load time to ensure they're available
 * before any operations fire.
 * 
 * @example
 * // In layout.tsx
 * <ErrorProvider>
 *   <ApiProvider>
 *     <YourApp />
 *   </ApiProvider>
 * </ErrorProvider>
 */

// ─────────────────────────────────────────────────────────────────────────
// Setup Error Handlers at Module Load Time
// ─────────────────────────────────────────────────────────────────────────

// API Error Handler - Shows RFC 7807 error details
setGlobalErrorHandler((error: ApiError) => {
  console.log("Global API error handler triggered:", error);
  console.log("Error details:", error.details);
  
  // Build error message from RFC 7807 details
  const detail = error.details.detail || error.message;
  const title = error.details.title;
  
  console.log("Showing toast with detail:", detail, "title:", title);
  
  // Show error using Sonner toast
  toast.error(detail || title, {
    description: detail ? title : undefined,
    duration: 5000,
  });
});

// Validation Error Handler - Shows field-level validation errors
setGlobalValidationErrorHandler((error: ValidationError) => {
  console.log("Global validation error handler triggered:", error);
  console.log("Field errors:", error.fieldErrors);
  
  // Show validation error with field details
  const fields = error.fieldErrors.map(f => f.field).join(", ");
  const firstError = error.fieldErrors[0]?.message || error.message;
  
  toast.error(firstError, {
    description: error.fieldErrors.length > 1 
      ? `Issues with: ${fields}`
      : undefined,
    duration: 5000,
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Error Provider Component
// ─────────────────────────────────────────────────────────────────────────

export function ErrorProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    console.log("ErrorProvider mounted - handlers are active");
  }, []);

  return (
    <>
      <Toaster position="bottom-right" />
      {children}
    </>
  );
}
