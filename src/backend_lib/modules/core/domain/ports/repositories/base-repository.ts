/**
 * Base Repository Interface
 * 
 * Provides common CRUD and query operations for all repository implementations.
 * Designed to be extended by specific repositories with domain-specific methods.
 * 
 * Generic Type: T extends { id: string } (ensures entities have an id property)
 */

export interface IBaseRepository<T extends { id: string }> {
  /**
   * Save a new entity or update an existing one
   */
  save(entity: T): Promise<T>;

  /**
   * Find entity by unique identifier
   */
  findById(id: string, isAudit?: boolean): Promise<T | null>;

  /**
   * Find entity by name (if applicable)
   */
  findByName(name: string, isAudit?: boolean): Promise<T | null>;

  /**
   * Find all entities, optionally including soft-deleted ones
   */
  findAll(isAudit?: boolean): Promise<T[]>;

  /**
   * Update an existing entity
   */
  update(entity: T): Promise<T>;

  /**
   * Delete entity (hard delete)
   */
  delete(id: string): Promise<void>;
}
