import { and, asc, desc, eq, isNull, sql, type SQL } from 'drizzle-orm';
import { DrizzleClient } from '../../../../shared/infrastructure/databases/drizzle-client';
import type { ListingQueryInput } from '../../../../shared/listing';
import { PaginationCursor } from '../../../../shared/listing';

/**
 * Base Repository Class
 * 
 * Provides common CRUD operations for all repositories.
 * Subclasses must implement:
 * - table: The Drizzle table to use
 * - toDomain(row: any): T - Convert database row to domain entity
 */
export abstract class BaseRepository<T extends { id: string }> {
  protected abstract table: any;

  /**
   * Convert database row to domain entity
   * Must be implemented by subclasses
   */
  protected abstract toDomain(row: any): T;

  async save(entity: T): Promise<T> {
    await DrizzleClient.insert(this.table).values(this.toPersistence(entity));
    return entity;
  }

  /**
   * Find entity by unique identifier
   * 
   * @param id - The entity ID to search for
   * @param isAudit - If true, includes soft-deleted records (audit mode). Default: false
   */
  async findById(id: string, isAudit: boolean = false): Promise<T | null> {
    const result = await DrizzleClient
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    if (!result.length) return null;

    const row = result[0];
    
    // Skip deleted records unless in audit mode
    if (!isAudit && row.deletedAt !== null) {
      return null;
    }

    return this.toDomain(row);
  }

  /**
   * Check whether an entity exists by id without hydrating the full row.
   *
   * This is cheaper than `findById()` when the caller only needs existence,
   * because it selects a constant and stops at the first match.
   *
   * @param id - The entity ID to search for
   * @param isAudit - If true, includes soft-deleted records (audit mode). Default: false
   */
  async existsById(id: string, isAudit: boolean = false): Promise<boolean> {
    const whereClause = isAudit
      ? eq(this.table.id, id)
      : and(eq(this.table.id, id), isNull(this.table.deletedAt));

    const result = await DrizzleClient
      .select({ exists: sql<number>`1` })
      .from(this.table)
      .where(whereClause)
      .limit(1);

    return result.length > 0;
  }

  /**
   * Find entity by name
   * 
   * @param name - The entity name to search for
   * @param isAudit - If true, includes soft-deleted records (audit mode). Default: false
   */
  async findByName(name: string, isAudit: boolean = false): Promise<T | null> {
    const result = await DrizzleClient
      .select()
      .from(this.table)
      .where(eq(this.table.name || this.table.title, name))
      .limit(1);

    if (!result.length) return null;

    const row = result[0];
    
    // Skip deleted records unless in audit mode
    if (!isAudit && row.deletedAt !== null) {
      return null;
    }

    return this.toDomain(row);
  }

  /**
   * Returns an un-awaited Drizzle query builder with WHERE, ORDER BY, and LIMIT applied.
   * Children call super.findAll(params), then chain .leftJoin() / .select(), and await.
   *
   * No params → all non-deleted rows, no pagination.
   * With ListingQueryInput → cursor, soft-delete, order, limit+1 via buildListQuery.
   *
   * Simple repositories can just `await super.findAll(params)` directly.
   */
  findAll(params?: ListingQueryInput, isAudit: boolean = false): any {
    if (!params) {
      return DrizzleClient
        .select()
        .from(this.table)
        .where(isAudit ? undefined : isNull(this.table.deletedAt))
        .$dynamic();
    }

    const { where, orderBy, limit } = this.buildListQuery(params, isAudit);

    return DrizzleClient
      .select()
      .from(this.table)
      .where(where.length > 0 ? and(...where) : undefined)
      .orderBy(...orderBy)
      .limit(limit)
      .$dynamic();
  }

  /**
   * The ordered list of sort-field names produced by the last {@link buildListQuery} call.
   * Use-cases read this after `findAll` to pass to `PaginationHelper.processPaginatedResults`.
   */
  get lastSortFields(): string[] {
    return this._lastSortFields;
  }
  private _lastSortFields: string[] = ['createdAt', 'id'];

  async update(entity: T): Promise<T> {
    await DrizzleClient
      .update(this.table)
      .set(this.toPersistence(entity))
      .where(eq(this.table.id, entity.id));
    return entity;
  }

  async delete(id: string): Promise<void> {
    await DrizzleClient
      .update(this.table)
      .set({ deletedAt: new Date() })
      .where(eq(this.table.id, id));
  }

  /**
   * Resolve a sort/cursor field name to a Drizzle column reference.
   * Override in child repositories for joined or computed columns
   * (e.g. `parentName` → `parentAlias.name`).
   */
  protected resolveColumn(field: string): any {
    return this.table[field];
  }

  /**
   * Converts ListingQueryInput into Drizzle-ready pieces and records sortFields for cursor encoding.
   * Children can also call this directly for fully custom queries.
   */
  protected buildListQuery(params: ListingQueryInput, isAudit: boolean = false) {
    const where: SQL[] = [];

    if (!isAudit && this.table.deletedAt) {
      where.push(isNull(this.table.deletedAt));
    }

    // -- Build the full ordered sort spec: user sorts first, then (createdAt, id) tiebreakers --
    const tiebreakers = new Set(['createdAt', 'id']);
    const effectiveSort: { field: string; direction: 'asc' | 'desc' }[] = [];

    if (params.sort?.length) {
      for (const s of params.sort) {
        effectiveSort.push({ field: s.field, direction: s.direction });
        tiebreakers.delete(s.field);
      }
    }

    const defaultDir: 'asc' | 'desc' = (params.pagination.direction ?? 'forward') === 'forward' ? 'desc' : 'asc';
    for (const tb of tiebreakers) {
      effectiveSort.push({ field: tb, direction: defaultDir });
    }

    const sortFields = effectiveSort.map(s => s.field);
    this._lastSortFields = sortFields;

    // -- Compound cursor WHERE clause --
    if (params.pagination.cursor) {
      const cursorValues = PaginationCursor.decode(params.pagination.cursor);
      const direction = params.pagination.direction ?? 'forward';

      const colRefs: SQL[] = [];
      const valRefs: SQL[] = [];

      const timestampFields = new Set(['createdAt', 'updatedAt']);

      for (const s of effectiveSort) {
        const col = this.resolveColumn(s.field);
        if (!col) continue;

        if (timestampFields.has(s.field)) {
          colRefs.push(sql`date_trunc('milliseconds', ${col})`);
          const ts = new Date(cursorValues[s.field] as number).toISOString();
          valRefs.push(sql`${ts}::timestamptz`);
        } else {
          colRefs.push(sql`${col}`);
          valRefs.push(sql`${cursorValues[s.field]}`);
        }
      }

      const colTuple = sql.join(colRefs, sql`, `);
      const valTuple = sql.join(valRefs, sql`, `);
      const op = direction === 'forward' ? sql`<` : sql`>`;

      where.push(sql`(${colTuple}) ${op} (${valTuple})`);
    }

    // -- ORDER BY from effectiveSort (skip fields not resolvable by this repository) --
    const orderBy: SQL[] = [];
    for (const s of effectiveSort) {
      const col = this.resolveColumn(s.field);
      if (!col) continue;
      orderBy.push(s.direction === 'asc' ? asc(col) : desc(col));
    }

    const limit = params.pagination.limit + 1;

    return { where, orderBy, limit, sortFields };
  }

  protected toPersistence(entity: T): any {
    return entity;
  }
}
