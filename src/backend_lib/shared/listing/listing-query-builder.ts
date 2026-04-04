import type { FilterCondition } from './listing-types';
import type { SortSpec } from './listing-types';
import type { PaginationDirection, PaginationQueryInput } from './pagination';
import { PaginationQueryDTO } from './pagination';

/**
 * Plain object produced by {@link ListingQuery.build} and consumed by application services / use cases.
 *
 * @remarks
 * Prefer passing this type (not {@link ListingQuery}) into domain logic so tests can use literals:
 * ```ts
 * const input: ListingQueryInput<'name'> = {
 *   pagination: { limit: 20, direction: 'forward' },
 *   filters: [{ field: 'name', op: 'contains', value: 'HR' }],
 * };
 * ```
 *
 * @typeParam F - Union of allowed **filter** and **sort** field names for this endpoint (whitelist).
 */
export interface ListingQueryInput<F extends string = string> {
  pagination: PaginationQueryInput;
  sort?: SortSpec<F>[] | undefined;
  filters?: FilterCondition<F>[] | undefined;
}

/**
 * Fluent builder for list queries. Use in the **HTTP / controller** layer after validation.
 *
 * @remarks
 * - Call {@link ListingQuery.paginate} exactly once before {@link ListingQuery.build}.
 * - {@link ListingQuery.filter} / {@link ListingQuery.sort} can be called in any order, zero or more times.
 * - Multiple filters are intended to be combined with **AND** in the repository (unless you document otherwise).
 *
 * @example
 * ```ts
 * type DeptFields = 'name' | 'created_at';
 *
 * const listing = new ListingQuery<DeptFields>()
 *   .paginate(20, req.query.cursor, 'forward')
 *   .filter({ field: 'name', op: 'contains', value: 'Engineering' })
 *   .sort({ field: 'created_at', direction: 'desc' })
 *   .build();
 *
 * await departmentService.list(listing);
 * ```
 *
 * @typeParam F - Same whitelist as {@link ListingQueryInput}.
 */
export class ListingQuery<F extends string = string> {
  private paginationState?: PaginationQueryInput;

  private readonly sortSpecs: SortSpec<F>[] = [];

  private readonly filterConditions: FilterCondition<F>[] = [];

  /**
   * Sets pagination. Use either a validated {@link PaginationQueryDTO}, a plain {@link PaginationQueryInput},
   * or `(limit, cursor?, direction?)` which delegates to `PaginationQueryDTO` (enforces limit 1–100).
   */
  paginate(pagination: PaginationQueryDTO | PaginationQueryInput): this;

  paginate(
    limit: number,
    cursor?: string | undefined,
    direction?: PaginationDirection | undefined
  ): this;

  paginate(
    paginationOrLimit: PaginationQueryDTO | PaginationQueryInput | number,
    cursor?: string,
    direction?: PaginationDirection
  ): this {
    if (typeof paginationOrLimit === 'number') {
      const dto = new PaginationQueryDTO(paginationOrLimit, cursor, direction);
      this.paginationState = {
        limit: dto.limit,
        cursor: dto.cursor,
        direction: dto.direction,
      };
      return this;
    }

    if (paginationOrLimit instanceof PaginationQueryDTO) {
      const dto = paginationOrLimit;
      this.paginationState = {
        limit: dto.limit,
        cursor: dto.cursor,
        direction: dto.direction,
      };
      return this;
    }

    this.paginationState = { ...paginationOrLimit };
    return this;
  }

  /**
   * Appends one filter (AND with other filters at repository level).
   */
  filter(condition: FilterCondition<F>): this {
    this.filterConditions.push(condition);
    return this;
  }

  /**
   * Appends multiple filters at once.
   */
  filters(conditions: Iterable<FilterCondition<F>> | FilterCondition<F>[]): this {
    this.filterConditions.push(...conditions);
    return this;
  }

  /**
   * Appends one sort key. Order of calls defines primary/secondary sort unless the repository normalizes.
   */
  sort(spec: SortSpec<F>): this {
    this.sortSpecs.push(spec);
    return this;
  }

  /**
   * Appends sort keys from parallel arrays of fields and directions.
   * If directions are fewer than fields, it falls back to the last provided direction, or 'desc'.
   */
  sortFromArrays(fields: F[] = [], directions: string[] = []): this {
    for (let i = 0; i < fields.length; i++) {
      const dir = directions[i] ?? directions[directions.length - 1] ?? 'desc';
      this.sort({ field: fields[i], direction: dir as 'asc' | 'desc' });
    }
    return this;
  }

  /**
   * Appends multiple sort keys at once.
   */
  sorts(specs: Iterable<SortSpec<F>> | SortSpec<F>[]): this {
    this.sortSpecs.push(...specs);
    return this;
  }

  /**
   * @returns Frozen copy of {@link ListingQueryInput} for the service layer.
   * @throws If {@link ListingQuery.paginate} was never called.
   */
  build(): ListingQueryInput<F> {
    if (this.paginationState === undefined) {
      throw new Error('ListingQuery.build(): paginate() must be called before build()');
    }

    return {
      pagination: { ...this.paginationState },
      sort: this.sortSpecs.length > 0 ? [...this.sortSpecs] : undefined,
      filters: this.filterConditions.length > 0 ? [...this.filterConditions] : undefined,
    };
  }
}
