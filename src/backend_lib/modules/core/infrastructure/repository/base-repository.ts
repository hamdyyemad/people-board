import { eq, isNull } from 'drizzle-orm';
import { DrizzleClient } from '../../../../shared/infrastructure/databases/drizzle-client';

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

  async findAll(isAudit = false): Promise<T[]> {
    const result = isAudit
      ? await DrizzleClient.select().from(this.table)
      : await DrizzleClient
          .select()
          .from(this.table)
          .where(isNull(this.table.deletedAt));
    return result.map(row => this.toDomain(row));
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
   * Convert domain entity to database persistence format
   * Subclasses can override for custom mapping
   */
  protected toPersistence(entity: T): any {
    return entity;
  }
}
