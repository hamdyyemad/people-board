/**
 * Cursor-based (keyset) pagination with **compound cursors**.
 *
 * @remarks
 * **Wire format:** A JSON object whose keys mirror the ORDER BY columns is base64-encoded
 * into an opaque string. Example payload for `ORDER BY name ASC, created_at DESC, id DESC`:
 * ```json
 * {"name":"Dept X","createdAt":1775001324774,"id":"abc-123"}
 * ```
 *
 * The cursor must always encode **every** column that appears in `ORDER BY`, including the
 * `(createdAt, id)` tiebreakers that the repository appends automatically.
 *
 * @see {@link PaginationHelper.processPaginatedResults} — trim `limit + 1` rows and set cursors
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
 * Compound cursor: encodes/decodes an ordered set of column values as
 * base64-encoded JSON. Date values are serialised as epoch-milliseconds
 * so they survive the round-trip without precision loss.
 */
/**
 * Internal key embedded in `prevCursor` payloads so the backend knows to use
 * backward logic without requiring the caller to send `direction=backward`.
 * Never surfaced to external consumers.
 */
const CURSOR_DIR_KEY = '_dir';

export const PaginationCursor = {
  /**
   * Build an opaque cursor from the sort-column values of a single row.
   *
   * @param values    - Column name → value map. `Date` is converted to ms epoch automatically.
   * @param direction - When `'backward'`, embeds `_dir:"backward"` so the repository can
   *                    use backward logic without a separate `direction` query param.
   */
  encode(values: Record<string, unknown>, direction?: PaginationDirection): string {
    const serialised: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(values)) {
      serialised[key] = val instanceof Date ? val.getTime() : val;
    }
    if (direction === 'backward') {
      serialised[CURSOR_DIR_KEY] = 'backward';
    }
    return Buffer.from(JSON.stringify(serialised), 'utf8').toString('base64');
  },

  /**
   * Decode an opaque cursor back to the column-value map **and** extract the
   * embedded direction (if any).
   *
   * Returns `{ values, direction }` where `values` has the `_dir` key stripped
   * so callers can use `values` directly as sort-column data.
   */
  decode(cursor: string): { values: Record<string, unknown>; direction: PaginationDirection } {
    try {
      const json = Buffer.from(cursor, 'base64').toString('utf-8');
      const parsed = JSON.parse(json);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('Cursor payload must be a JSON object');
      }

      const direction: PaginationDirection =
        parsed[CURSOR_DIR_KEY] === 'backward' ? 'backward' : 'forward';

      const values = { ...parsed };
      delete values[CURSOR_DIR_KEY];

      return { values, direction };
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
   * @returns Decoded compound cursor values, or `null` on the first page.
   * @throws If `cursor` is set but malformed.
   */
  getCursorData(): Record<string, unknown> | null {
    if (!this.cursor) return null;
    return PaginationCursor.decode(this.cursor);
  }
}

/**
 * Static helpers for validating query params and shaping page results.
 */
export class PaginationHelper {
  /**
   * Truncates to `limit` items, detects `hasMore`, and builds compound cursors.
   *
   * @param entities      - Rows from DB (length ≤ `limit + 1`).
   * @param limit         - Requested page size (not `limit + 1`).
   * @param sortFields    - Ordered column names that match the ORDER BY (including tiebreakers).
   *                        Used to extract cursor values from each row.
   * @param requestCursor - Pass the original request cursor so we know if this is page 1.
   * @param extractValue  - Optional function to pull a JSON-safe scalar from an entity for a
   *                        given sort field. Useful when domain entities wrap fields in value
   *                        objects (e.g. `DepartmentName`). When omitted, `row[field]` is used.
   * @param direction     - Pass `params.pagination.direction` so backward pages are reversed.
   *
   * @remarks
   * **Backward pagination invariant:** `buildListQuery` issues the DB query with all sort
   * directions flipped and uses `>` instead of `<`, so the database returns the N rows
   * *closest* to the cursor in reversed order. This function reverses them back to the
   * original display order before computing cursors.
   *
   * Cursor semantics after reversal (items always in original sort order):
   * - `nextCursor` – present when there are forward pages OR the user just navigated backward
   *   (so they can always go forward again). Points to `items[last]`.
   * - `prevCursor` – present when there are further backward pages (`hasMore` on a backward
   *   request) OR when this is a forward page that isn't the first page. Points to `items[0]`.
   */
  static processPaginatedResults<T extends Record<string, any>>(
    entities: T[],
    limit: number,
    sortFields: string[],
    requestCursor?: string | undefined,
    extractValue?: (row: T, field: string) => unknown,
    direction?: PaginationDirection,
  ): {
    items: T[];
    hasMore: boolean;
    nextCursor?: string | undefined;
    prevCursor?: string | undefined;
  } {
    const isBackward = direction === 'backward';
    const hasMore = entities.length > limit;
    const rawItems = entities.slice(0, limit);

    // The repository issues a reversed ORDER BY for backward requests so LIMIT
    // picks the N rows closest to the cursor. Reverse here to restore original order.
    const items = isBackward ? [...rawItems].reverse() : rawItems;

    const getValue = extractValue ?? ((row: T, field: string) => row[field]);

    const extractCursorValues = (row: T): Record<string, unknown> => {
      const values: Record<string, unknown> = {};
      for (const field of sortFields) {
        values[field] = getValue(row, field);
      }
      return values;
    };

    // nextCursor: always set on a backward page (user may want to go forward again);
    //             on a forward page, only set when there are more pages ahead.
    // No _dir embedded — forward is the default and needs no extra flag.
    const nextCursor =
      items.length > 0 && (isBackward || hasMore)
        ? PaginationCursor.encode(extractCursorValues(items[items.length - 1]))
        : undefined;

    // prevCursor: on a backward page, only set when there are more pages behind (hasMore);
    //             on a forward page, set whenever we received a cursor (i.e. not page 1).
    // _dir:"backward" is embedded so the backend uses backward logic even when the
    // caller does not send an explicit direction=backward query param.
    const prevCursor =
      items.length > 0 && (isBackward ? hasMore : !!requestCursor)
        ? PaginationCursor.encode(extractCursorValues(items[0]), 'backward')
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
