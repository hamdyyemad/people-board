import { z } from 'zod';

/**
 * Generic list query slice for any resource. Domain modules should `.extend()` and override
 * `sortBy` with `z.enum([...])` for whitelisted columns.
 *
 * Optional next step: add `.superRefine` using `PaginationCursor.decode` when `cursor` is set,
 * so malformed cursors fail validation instead of the use case.
 */
export const basePaginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  direction: z.enum(['forward', 'backward']).default('forward'),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type BasePaginationQuery = z.infer<typeof basePaginationQuerySchema>;