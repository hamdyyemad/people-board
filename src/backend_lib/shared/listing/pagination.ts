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
export const PaginationCursor = {
  /**
   * Build an opaque cursor from the sort-column values of a single row.
   *
   * @param values - Column name → value map. `Date` is converted to ms epoch automatically.
   */
  encode(values: Record<string, unknown>): string {
    const serialised: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(values)) {
      serialised[key] = val instanceof Date ? val.getTime() : val;
    }
    return Buffer.from(JSON.stringify(serialised), 'utf8').toString('base64');
  },

  /**
   * Decode an opaque cursor back to the column-value map.
   * Callers must know which keys are timestamps and convert them back to `Date` as needed.
   */
  decode(cursor: string): Record<string, unknown> {
    try {
      const json = Buffer.from(cursor, 'base64').toString('utf-8');
      const parsed = JSON.parse(json);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('Cursor payload must be a JSON object');
      }
      return parsed as Record<string, unknown>;
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
   * @param entities  - Rows from DB (length ≤ `limit + 1`).
   * @param limit     - Requested page size (not `limit + 1`).
   * @param sortFields - Ordered column names that match the ORDER BY (including tiebreakers).
   *                     Used to extract cursor values from each row.
   * @param requestCursor - Pass the original request cursor so we know if this is page 1.
   * @param extractValue  - Optional function to pull a JSON-safe scalar from an entity for a
   *                        given sort field. Useful when domain entities wrap fields in value
   *                        objects (e.g. `DepartmentName`). When omitted, `row[field]` is used.
   */
  static processPaginatedResults<T extends Record<string, any>>(
    entities: T[],
    limit: number,
    sortFields: string[],
    requestCursor?: string | undefined,
    extractValue?: (row: T, field: string) => unknown
  ): {
    items: T[];
    hasMore: boolean;
    nextCursor?: string | undefined;
    prevCursor?: string | undefined;
  } {
    const hasMore = entities.length > limit;
    const items = entities.slice(0, limit);

    const getValue = extractValue ?? ((row: T, field: string) => row[field]);

    const extractCursorValues = (row: T): Record<string, unknown> => {
      const values: Record<string, unknown> = {};
      for (const field of sortFields) {
        values[field] = getValue(row, field);
      }
      return values;
    };

    const nextCursor =
      hasMore && items.length > 0
        ? PaginationCursor.encode(extractCursorValues(items[items.length - 1]))
        : undefined;

    const prevCursor =
      requestCursor && items.length > 0
        ? PaginationCursor.encode(extractCursorValues(items[0]))
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
