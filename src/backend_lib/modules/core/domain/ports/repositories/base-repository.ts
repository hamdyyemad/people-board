import type { ListingQueryInput } from '@/backend_lib/shared/listing';

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
   * Check whether an entity exists by unique identifier
   */
  existsById(id: string, isAudit?: boolean): Promise<boolean>;

  /**
   * Find entity by name (if applicable)
   */
  findByName(name: string, isAudit?: boolean): Promise<T | null>;

  /**
   * No params → all non-deleted rows.
   * With `ListingQueryInput` → paginated (limit+1), cursor-filtered, sorted.
   */
  findAll(params?: ListingQueryInput, isAudit?: boolean): Promise<T[]>;

  /**
   * Update an existing entity
   */
  update(entity: T): Promise<T>;

  /**
   * Delete entity (hard delete)
   */
  delete(id: string): Promise<void>;
}
