/**
 * Zod Validation Utilities
 * 
 * General-purpose validation helpers that can be used across all API modules.
 * These utilities are framework-agnostic and can be reused for any Zod schema.
 */

import { z } from 'zod';
import { ValidationError } from '@/frontend_lib/errors/validation-errors';

/**
 * Validates data against a Zod schema and throws ValidationError on failure
 * 
 * Use this when you want to validate and throw an error immediately if invalid.
 * The error should be caught by the calling code (component/form) to display
 * field-specific errors in the UI.
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated and typed data
 * @throws ValidationError if validation fails
 * 
 * @example
 * // In component/form - handle validation errors
 * const handleSubmit = async (formData: any) => {
 *   try {
 *     const validated = validateOrThrow(createUserSchema, formData);
 *     await createUser(validated); // API layer also validates
 *   } catch (error) {
 *     if (error instanceof ValidationError) {
 *       // Show field-specific errors in form
 *       error.fieldErrors.forEach(({ field, message }) => {
 *         form.setError(field, { message });
 *       });
 *     }
 *     // API errors handled by useGenericMutation
 *   }
 * };
 */
export function validateOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors: Record<string, string> = {};

    result.error.issues.forEach((err) => {
      const field = err.path.join('.');
      errors[field] = err.message;
    });

    // Create validation error with first error message as main message
    const validationError = new ValidationError(
      Object.values(errors)[0] || 'Validation failed', 
      errors
    );
    
    // Just throw - let the component/form handle it
    // Don't trigger global handler here - validation errors should show in forms
    throw validationError;
  }
  
  return result.data;
}

/**
 * Validates data and returns { success, data, errors }
 * Useful for progressive validation without throwing
 * 
 * Use this when you want to validate but handle the result manually
 * instead of throwing an error.
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with success flag, data, and errors
 * 
 * @example
 * // Progressive validation (as user types)
 * const handleChange = (field: string, value: string) => {
 *   const newData = { ...formData, [field]: value };
 *   setFormData(newData);
 *   
 *   const result = validateSafe(createUserSchema, newData);
 *   if (!result.success) {
 *     setErrors(result.errors);
 *   } else {
 *     setErrors({});
 *   }
 * };
 */
export function validateSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): 
  | { success: true; data: T; errors: null }
  | { success: false; data: null; errors: Record<string, string> } 
{
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors: Record<string, string> = {};
    
    result.error.errors.forEach((err) => {
      const field = err.path.join('.');
      errors[field] = err.message;
    });
    
    return { success: false, data: null, errors };
  }
  
  return { success: true, data: result.data, errors: null };
}

/**
 * Validates a single field against any schema
 * Useful for real-time field validation
 * 
 * @param schema - Zod schema to validate against
 * @param value - Value to validate
 * @returns Error message if invalid, null if valid
 * 
 * @example
 * const emailError = validateField(z.string().email(), emailInput);
 * if (emailError) {
 *   setEmailError(emailError);
 * }
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): string | null {
  const result = schema.safeParse(value);
  
  if (!result.success) {
    return result.error.errors[0]?.message || 'Validation failed';
  }
  
  return null;
}

/**
 * Common validation schema helpers
 * Reusable schema components for consistent validation across modules
 */

/**
 * UUID validation helper (optional)
 * Accepts: valid UUID, empty string (converted to null), or null
 */
export const uuidOptional = z
  .union([
    z.string().uuid('Must be a valid UUID'),
    z.literal('').transform(() => null),
    z.null(),
  ])
  .optional();

/**
 * UUID validation helper (required)
 * Accepts: valid UUID only
 */
export const uuidRequired = z.string().uuid('Must be a valid UUID');

/**
 * Email validation helper
 */
export const emailSchema = z
  .string({ required_error: 'Email is required' })
  .email('Must be a valid email address')
  .toLowerCase()
  .trim();

/**
 * Password validation helper (basic)
 */
export const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters');

/**
 * URL validation helper
 */
export const urlSchema = z
  .string()
  .url('Must be a valid URL')
  .trim();

/**
 * Phone number validation helper (basic)
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s()-]{10,}$/, 'Must be a valid phone number')
  .trim();
