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

import { isUuid } from '@/backend_lib/shared/validation';
import { EntityIdError } from '@/backend_lib/shared/exceptions';

const ENTITY_ID_MESSAGES = {
  EMPTY: 'Id cannot be empty',
  INVALID_UUID: 'Id must be a valid UUID',
} as const;

export abstract class BaseEntity<E = any> {
  protected domainEvents: E[] = [];

  constructor(
    public id: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    // We have moved validation to a separate init() method that subclasses must call at the end of their constructor.
    // this.validate();
    // this.validateEntityId();
  }

  /** Call once at end of subclass constructor. */
  protected init(): void {
    this.validateEntityId();
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
   * Validates the aggregate root `id`: non-empty and UUID-shaped (matches DB uuid columns).
   * Concrete implementation shared by all entities; subclasses do not override this.
   */
  protected validateEntityId(): void {
    if (this.id == null || typeof this.id !== 'string' || this.id.trim() === '') {
      throw new EntityIdError(ENTITY_ID_MESSAGES.EMPTY);
    }
    if (!isUuid(this.id.trim())) {
      throw new EntityIdError(ENTITY_ID_MESSAGES.INVALID_UUID);
    }
  }

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
