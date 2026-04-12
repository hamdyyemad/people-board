export interface Pagination<T> {
  data: T[];
  pagination: IPaginationMeta;
}

export interface IPaginationMeta {
  hasMore: boolean;
  nextCursor?: string | undefined;
  prevCursor?: string | undefined;
  /** Row count in `data` for this response (after removing the extra probe row). */
  count: number;
  /** Total records matching current filters, ignoring pagination. Used for "Page X of Y". */
  totalCount?: number | undefined;
}

/**
 * Generic list query params — mirrors the backend `basePaginationQuerySchema`.
 * All fields are optional; omitting them falls back to server defaults.
 *
 * Resource-specific params extend this type and add their own filter fields.
 * @see DepartmentListParams for an example.
 */
export interface ListParams {
  limit?: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
