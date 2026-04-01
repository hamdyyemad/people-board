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
   * Converts ListingQueryInput into Drizzle-ready pieces.
   * Children can also call this directly for fully custom queries.
   */
  protected buildListQuery(params: ListingQueryInput, isAudit: boolean = false) {
    const where: SQL[] = [];

    if (!isAudit && this.table.deletedAt) {
      where.push(isNull(this.table.deletedAt));
    }

    if (params.pagination.cursor) {
      const { createdAt, id } = PaginationCursor.decode(params.pagination.cursor);
      const ts = createdAt.toISOString();
      const direction = params.pagination.direction ?? 'forward';

      if (direction === 'forward') {
        where.push(sql`(${this.table.createdAt}, ${this.table.id}) < (${ts}::timestamptz, ${id})`);
      } else {
        where.push(sql`(${this.table.createdAt}, ${this.table.id}) > (${ts}::timestamptz, ${id})`);
      }
    }

    const directionFn = (params.pagination.direction ?? 'forward') === 'forward' ? desc : asc;

    const orderBy: SQL[] = [];

    if (params.sort?.length) {
      for (const s of params.sort) {
        const col = this.table[s.field];
        if (col) {
          orderBy.push(s.direction === 'asc' ? asc(col) : desc(col));
        }
      }
    }

    orderBy.push(directionFn(this.table.createdAt), directionFn(this.table.id));

    const limit = params.pagination.limit + 1;

    return { where, orderBy, limit };
  }

  protected toPersistence(entity: T): any {
    return entity;
  }
}
