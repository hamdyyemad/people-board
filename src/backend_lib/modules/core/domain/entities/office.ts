/**
 * Office Entity
 *
 * Database Table: offices
 * Schema Last Updated: see migrations 001, 005–008 (address, city_id, lat/long; country via city).
 *
 * Table Structure:
 *   id UUID PRIMARY KEY
 *   name TEXT NOT NULL
 *   city_id UUID NOT NULL REFERENCES cities(id)
 *   is_active BOOLEAN DEFAULT true
 *   address TEXT (nullable)
 *   latitude NUMERIC(10, 8) (nullable, paired with longitude)
 *   longitude NUMERIC(11, 8) (nullable, paired with latitude)
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 *   deleted_at TIMESTAMPTZ
 *
 * Country is not stored on the row: derive via city_id → cities.country_id → countries.
 */
// ==================================================================
// 💡 Common DDD rule:
// Entities are mutable, but Value Objects are immutable.
// ==================================================================
// src/backend_lib/modules/core/domain/entities/office.ts

// BaseEntity is the base class for all entities in the domain. It provides common properties and methods for managing domain events, soft deletion, and validation. Each entity must implement its own validation logic by overriding the abstract validate() method. The constructor initializes the entity with an id and timestamps, and calls validation methods to ensure the entity is in a valid state upon creation. Domain events can be added, retrieved, and cleared using the provided methods.
import { BaseEntity } from './base-entity';
// Value Objects
import { OfficeAddress, OfficeCoordinates, OfficeName } from '../value-objects/office';
// Domain Events
import { OfficeCreatedEvent } from '../events/office/office-created';
// Constants
import { OFFICE_MESSAGES } from '../constants';
// We have moved the validation logic for the entity ID into the BaseEntity class, since all entities share the same requirements for their IDs (non-empty and UUID-shaped). This promotes code reuse and consistency across all entities. Each entity can still implement its own specific validation logic in the validate() method, but they will all benefit from the shared ID validation logic in the base class.
import { isUuid } from '@/backend_lib/shared/validation';
// We have moved the EntityIdError and ValidationError into the shared exceptions module, since they are common error types that can be used across multiple entities and modules in the application. This promotes better organization and reuse of error types, and keeps our domain entities focused on their specific business logic rather than error handling details.
import { ValidationError } from '@/backend_lib/shared/exceptions';

export class Office extends BaseEntity<OfficeCreatedEvent> {
  public readonly city_id: string;
  public readonly address: OfficeAddress;
  public readonly coordinates: OfficeCoordinates;

  /**
   * `city_id` references `cities.id` (country comes from that city).
   * Address and coordinates are composed from raw persistence/API values in the constructor.
   */
  constructor(
    public id: string,
    public name: OfficeName,
    cityIdRaw: string,
    public is_active: boolean = true,
    addressRaw: string | null,
    latitudeRaw: string | null,
    longitudeRaw: string | null,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this.city_id = cityIdRaw.trim();
    this.address = new OfficeAddress(addressRaw);
    this.coordinates = new OfficeCoordinates(latitudeRaw, longitudeRaw);
    this.init();
  }

  protected validate(): void {
    // this.init() already runs this.validateId behind the scenes, no need to type it again
    
    if (!isUuid(this.city_id)) throw new ValidationError(OFFICE_MESSAGES.CITY_ID_INVALID);
  }
}
