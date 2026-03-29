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
 * Sets up error handlers when the component mounts via useEffect,
 * ensuring proper React lifecycle management and SSR compatibility.
 * 
 * @example
 * // In layout.tsx
 * <ErrorProvider>
 *   <ApiProvider>
 *     <YourApp />
 *   </ApiProvider>
 * </ErrorProvider>
 */
export function ErrorProvider({ children }: { children: ReactNode }) {
  
  useEffect(() => {
    // 1. Setup API Error Handler
    setGlobalErrorHandler((error: ApiError) => {
      const detail = error.details.detail || error.message;
      const title = error.details.title;
      
      toast.error(detail || title, {
        description: detail ? title : undefined,
        duration: 5000,
      });
    });

    // 2. Setup Validation Error Handler
    setGlobalValidationErrorHandler((error: ValidationError) => {  
      const fields = error.fieldErrors.map(f => f.field).join(", ");
      const firstError = error.fieldErrors[0]?.message || error.message;
      
      toast.error(firstError, {
        description: error.fieldErrors.length > 1 
          ? `Issues with: ${fields}`
          : undefined,
        duration: 5000,
      });
    });
  }, []);
  
  return (
    <>
      <Toaster position="bottom-right" richColors />
      {children}
    </>
  );
}