/**
 * Base Entity Class
 * 
 * Provides common functionality for all aggregate root entities in the domain:
 * - Timestamp management (createdAt, updatedAt, deletedAt)
 * - Domain events management
 * - Soft delete lifecycle methods
 * - Validation hooks
 * 
 * Generic Type: E extends DomainEvent (for type-safe event management)
 */

export abstract class BaseEntity<E = any> {
  protected domainEvents: E[] = [];

  constructor(
    public id: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    this.validate();
  }

  /**
   * Validation logic specific to each entity.
   * Must be implemented by subclasses.
   * We have moved from private to protected to allow subclasses to call super.validate() if needed.
   * private = only the base class can use it (blocks subclasses)
   * protected = base class + subclasses can use it (allows overriding the abstract method)
   */
  protected abstract validate(): void;

  /**
   * Check if entity is logically active (not soft-deleted)
   */
  isActive(): boolean {
    return this.deletedAt === null;
  }

  /**
   * Soft delete the entity
   */
  softDelete(): void {
    this.deletedAt = new Date();
    this.markAsUpdated();
  }

  /**
   * Restore a soft-deleted entity
   */
  restore(): void {
    this.deletedAt = null;
    this.markAsUpdated();
  }

  /**
   * Update the updatedAt timestamp
   */
  markAsUpdated(): void {
    this.updatedAt = new Date();
  }

  /**
   * Add a domain event to the entity
   */
  addDomainEvent(event: E): void {
    this.domainEvents.push(event);
  }

  /**
   * Get all domain events for this entity
   */
  getDomainEvents(): E[] {
    return this.domainEvents;
  }

  /**
   * Clear all domain events after publishing
   */
  clearDomainEvents(): void {
    this.domainEvents = [];
  }
}
