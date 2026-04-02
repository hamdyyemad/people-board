import { z } from 'zod';

/**
 * Generic list query slice for any resource. Domain modules should `.extend()` and override
 * `sortBy` with a transform that validates individual column names.
 *
 * `sortBy` and `sortOrder` accept **comma-separated** values for compound sorting:
 * `?sortBy=name,createdAt&sortOrder=asc,desc`
 *
 * After parsing these become `string[]`. If `sortOrder` has fewer elements than `sortBy`,
 * the last provided direction is repeated for the remaining columns.
 */
export const basePaginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  direction: z.enum(['forward', 'backward']).default('forward'),
  sortBy: z.string().default('createdAt').transform(v => v.split(',').map(s => s.trim())),
  sortOrder: z.string().default('desc').transform(v =>
    v.split(',').map(s => s.trim())
  ).refine(
    arr => arr.every(d => d === 'asc' || d === 'desc'),
    { message: 'Each sortOrder value must be "asc" or "desc"' }
  ),
});

export type BasePaginationQuery = z.output<typeof basePaginationQuerySchema>;