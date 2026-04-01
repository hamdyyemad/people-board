/**
 * @packageDocumentation
 * Shared **listing** utilities: cursor pagination, sort/filter types, and a fluent {@link ListingQuery}
 * builder for list endpoints.
 *
 * @remarks
 * ## Import
 * ```ts
 * import {
 *   ListingQuery,
 *   PaginationQueryDTO,
 *   PaginationHelper,
 *   PaginationCursor,
 *   type ListingQueryInput,
 *   type PaginatedResponse,
 * } from '@/backend_lib/shared/listing';
 * ```
 *
 * ## Typical flow (HTTP → service → DB)
 * 1. **Route:** Parse `limit`, `cursor`, `direction`, optional sort/filter query params.
 * 2. **Validate:** Use Zod (or similar) + optionally {@link PaginationHelper.validateParameters} for quick guards.
 * 3. **Build:** `new ListingQuery<FieldUnion>().paginate(...).filter(...).sort(...).build()` → {@link ListingQueryInput}.
 * 4. **Service / use case:** Accept `ListingQueryInput` only; call `listing.pagination` + `getCursorData()` patterns via {@link PaginationQueryDTO} or plain `pagination` object.
 * 5. **Repository:** Fetch **`limit + 1`** rows, `ORDER BY created_at DESC, id DESC`, keyset `WHERE` using decoded cursor `(created_at, id)`.
 * 6. **Response:** {@link PaginationHelper.processPaginatedResults} → build {@link PaginatedResponse} with `data` + `pagination` ({@link IPaginationMeta}).
 *
 * ## Roadmap (implement in your app next)
 * - Add Zod (or similar) schemas for list query params per resource; map to {@link ListingQuery} / plain {@link ListingQueryInput}.
 * - Implement `findPage` (or equivalent) on repositories: decode cursor, apply filters/sorts with **whitelisted** fields only.
 * - Replace “load all” use cases with paginated ones; return {@link PaginatedResponse} from API routes.
 * - Update clients: pass `nextCursor` on “load more”, respect `hasMore`.
 *
 * @see {@link ListingQuery} — fluent builder (controllers)
 * @see {@link ListingQueryInput} — service/use-case input shape
 * @see {@link pagination.ts} — cursor encoding and page metadata
 */

export type {
  PaginationDirection,
  PaginationQueryInput,
  IPaginationMeta,
  PaginatedResponse,
} from './pagination';

export { PaginationCursor, PaginationQueryDTO, PaginationHelper } from './pagination';

export type { SortDirection, SortSpec, FilterScalar, FilterOperator, FilterCondition } from './listing-types';

export type { ListingQueryInput } from './listing-query-builder';

export { ListingQuery } from './listing-query-builder';
