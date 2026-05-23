/**
 * Validates the request body as JSON and against a Zod schema.
 * Uses the framework adapter (getBody) so it stays framework-agnostic.
 *
 * - Invalid JSON → returns { errorResponse } (400)
 * - Validation failure → throws ValidationError (400 via error handler)
 * - Success → returns { data: T }
 */

import type { FrameworkRequest, FrameworkResponse } from '../adapters/current';
import { getBody } from '../adapters/current';
import { createErrorResponseFromDetails } from '../http/response';
import { ValidationError } from '../exceptions';
import { z, ZodIssue } from 'zod';

export async function validateRequestBody<TSchema extends z.ZodTypeAny>(
  request: FrameworkRequest,
  schema: TSchema
): Promise<{ data: z.output<TSchema> } | { errorResponse: FrameworkResponse }> {
  let body: unknown;
  try {
    body = await getBody(request);
  } catch {
    return {
      errorResponse: createErrorResponseFromDetails(
        request,
        'invalid-json',
        'Bad Request',
        400,
        'Invalid JSON in request body.'
      ),
    };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const detail =
      parsed.error.issues.map((e: ZodIssue) => e.message).join('; ') || 'Validation failed';
    throw new ValidationError(detail);
  }

  return { data: parsed.data };
}

/**
 * Validates URL query parameters against a Zod schema.
 * 
 * - Missing or invalid params → throws ValidationError (400 via error handler)
 * - Success → returns { data: T }
 */
export function validateRequestQueryParams<TSchema extends z.ZodTypeAny>(
  request: FrameworkRequest,
  schema: TSchema
): { data: z.output<TSchema> } | { errorResponse: FrameworkResponse } {
  const { searchParams } = new URL(request.url);
  
  // Convert URLSearchParams to object
  const params = Object.fromEntries(searchParams);

  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    const detail =
      parsed.error.issues.map((e: ZodIssue) => e.message).join('; ') || 'Validation failed';
    throw new ValidationError(detail);
  }

  return { data: parsed.data };
}

// src/backend_lib/shared/validation.ts (add to existing file)

/**
 * Validates route parameters against a Zod schema.
 * Route params come from Next.js route segments like [id], [userId], etc.
 *
 * - Invalid params → throws ValidationError (400 via error handler)
 * - Success → returns { data: T }
 */
export function validateRouteParams<TSchema extends z.ZodTypeAny>(
  params: Record<string, string | string[]>,
  schema: TSchema
): { data: z.output<TSchema> } | { errorResponse: FrameworkResponse } {
  const parsed = schema.safeParse(params);
  
  if (!parsed.success) {
    const detail =
      parsed.error.issues.map((e: ZodIssue) => e.message).join('; ') || 'Invalid route parameters';
    throw new ValidationError(detail);
  }

  return { data: parsed.data };
}