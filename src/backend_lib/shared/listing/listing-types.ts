/**
 * Sort and filter **AST-style** types for list queries.
 *
 * @remarks
 * - **HTTP:** Map query strings (e.g. `sort=-created_at`, `filter[name][eq]=x`) into {@link SortSpec} /
 *   {@link FilterCondition} with a **whitelist** per resource.
 * - **Use case:** Pass through or normalize values; never trust arbitrary `field` names for SQL.
 * - **Repository:** `switch (condition.field)` on allowed keys only; map {@link FilterOperator} to Drizzle
 *   (`eq`, `inArray`, `ilike`, `isNull`, etc.).
 */

export type SortDirection = 'asc' | 'desc';

/**
 * Single-column sort. Build `ORDER BY` from an array of specs (first = primary unless you reorder).
 */
export interface SortSpec<F extends string = string> {
  field: F;
  direction: SortDirection;
}

export type FilterScalar = string | number | boolean | null;

/**
 * Relational / text operators; repositories interpret per column type.
 */
export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'contains'
  | 'isNull'
  | 'isNotNull';

/**
 * One predicate. Use `value` as an array for `in`; omit for `isNull` / `isNotNull`.
 */
export interface FilterCondition<F extends string = string> {
  field: F;
  op: FilterOperator;
  value?: FilterScalar | FilterScalar[] | undefined;
}
