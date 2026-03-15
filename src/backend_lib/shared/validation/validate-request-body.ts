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
import type { ZodType } from 'zod';
import { ZodIssue } from 'zod';

export async function validateRequestBody<T>(
  request: FrameworkRequest,
  schema: ZodType<T>
): Promise<{ data: T } | { errorResponse: FrameworkResponse }> {
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
      parsed.error.errors.map((e: ZodIssue) => e.message).join('; ') || 'Validation failed';
    throw new ValidationError(detail);
  }

  return { data: parsed.data };
}
