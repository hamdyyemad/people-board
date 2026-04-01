/**
 * Cursor-based (keyset) pagination: encoding, request DTO, response shape, and helpers.
 *
 * @remarks
 * **Wire format:** `${createdAt.getTime()}:${id}` as UTF-8, then standard **base64** (opaque to clients).
 *
 * **Recommended DB order:** `ORDER BY created_at DESC, id DESC` (matches composite indexes). Forward page:
 * `(created_at, id) < ($cursorCreatedAt, $cursorId)` after decoding {@link PaginationCursor}.
 *
 * @see {@link PaginationHelper.processPaginatedResults} — trim `limit + 1` rows and set cursors
 * @see {@link PaginationQueryDTO.getCursorData} — decode cursor for repositories
 */

export type PaginationDirection = 'forward' | 'backward';

/**
 * Pagination slice of a list request (no validation by itself).
 *
 * @remarks
 * Use inside `ListingQueryInput` (see `listing-query-builder.ts`) or build manually in tests.
 */
export interface PaginationQueryInput {
  limit: number;
  cursor?: string | undefined;
  direction?: PaginationDirection | undefined;
}

/**
 * JSON-friendly pagination metadata for list responses.
 */
export interface IPaginationMeta {
  hasMore: boolean;
  nextCursor?: string | undefined;
  prevCursor?: string | undefined;
  /** Row count in `data` for this response (after removing the extra probe row). */
  count: number;
}

/**
 * Standard list API body: rows + {@link IPaginationMeta}.
 *
 * @example
 * ```ts
 * const res: PaginatedResponse<DepartmentDto> = {
 *   data: page.items,
 *   pagination: {
 *     hasMore: page.hasMore,
 *     nextCursor: page.nextCursor,
 *     prevCursor: page.prevCursor,
 *     count: page.items.length,
 *   },
 * };
 * ```
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: IPaginationMeta;
}

/**
 * Encodes and decodes opaque cursors (`timestampMs:uuid` → base64).
 *
 * @remarks
 * - **Encode** when building `nextCursor` / `prevCursor` after a query.
 * - **Decode** in the use case or repository when `cursor` is present (or use {@link PaginationQueryDTO.getCursorData}).
 */
export const PaginationCursor = {
  encode(createdAt: Date, id: string): string {
    return Buffer.from(`${createdAt.getTime()}:${id}`, 'utf8').toString('base64');
  },

  decode(cursor: string): { createdAt: Date; id: string } {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      const [timestamp, ...idParts] = decoded.split(':');
      const id = idParts.join(':');

      if (!timestamp || !id) {
        throw new Error('Invalid cursor format');
      }

      const createdAt = new Date(parseInt(timestamp, 10));
      if (Number.isNaN(createdAt.getTime())) {
        throw new Error('Invalid timestamp in cursor');
      }

      return { createdAt, id };
    } catch (error) {
      throw new Error(
        `Failed to decode cursor: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
} as const;

/**
 * Validated pagination input: **limit** must be 1–100.
 *
 * @remarks
 * Construct in routes after parsing query params. Use {@link PaginationQueryDTO.getCursorData} before calling
 * the repository when `cursor` is set.
 */
export class PaginationQueryDTO implements PaginationQueryInput {
  readonly limit: number;
  readonly cursor?: string | undefined;
  readonly direction: PaginationDirection;

  constructor(
    limit: number = 20,
    cursor?: string,
    direction: PaginationDirection = 'forward'
  ) {
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    this.limit = limit;
    this.cursor = cursor;
    this.direction = direction;
  }

  /**
   * @returns Decoded cursor for keyset `WHERE`, or `null` on the first page.
   * @throws If `cursor` is set but malformed (same as {@link PaginationCursor.decode}).
   */
  getCursorData(): { createdAt: Date; id: string } | null {
    if (!this.cursor) return null;
    return PaginationCursor.decode(this.cursor);
  }
}

/**
 * Static helpers for validating query params and shaping page results.
 */
export class PaginationHelper {
  /**
   * Truncates to `limit` items, sets `hasMore` from the `(limit + 1)`-th row, and fills cursor hints.
   *
   * @param entities - Rows from DB, typically ordered `created_at DESC, id DESC`, length ≤ `limit + 1`.
   * @param limit - Same as request limit (not `limit + 1`).
   *
   * @example
   * ```ts
   * const rows = await repo.findPage({ ... }); // fetch limit + 1
   * const { items, hasMore, nextCursor, prevCursor } = PaginationHelper.processPaginatedResults(
   *   rows,
   *   query.limit,
   *   query.direction,
   * );
   * ```
   */
  static processPaginatedResults<T extends { id: string; createdAt: Date }>(
    entities: T[],
    limit: number,
    _direction: PaginationDirection = 'forward'
  ): {
    items: T[];
    hasMore: boolean;
    nextCursor?: string | undefined;
    prevCursor?: string | undefined;
  } {
    const hasMore = entities.length > limit;
    const items = entities.slice(0, limit);

    const nextCursor =
      hasMore && items.length > 0
        ? PaginationCursor.encode(items[items.length - 1].createdAt, items[items.length - 1].id)
        : undefined;

    const prevCursor =
      items.length > 0
        ? PaginationCursor.encode(items[0].createdAt, items[0].id)
        : undefined;

    return {
      items,
      hasMore,
      nextCursor,
      prevCursor,
    };
  }

  /**
   * Cheap guard for middleware / early 400s: valid limit range, optional direction, decodable cursor.
   *
   * @remarks
   * Still parse/coerce `limit` to number in the route before calling; invalid `NaN` should fail here.
   */
  static validateParameters(limit: number, cursor?: string, direction?: string): boolean {
    if (limit < 1 || limit > 100) return false;
    if (direction !== undefined && direction !== '' && !['forward', 'backward'].includes(direction)) {
      return false;
    }
    if (cursor) {
      try {
        PaginationCursor.decode(cursor);
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }
}
