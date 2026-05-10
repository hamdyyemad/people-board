/**
 * City Entity
 *
 * Database Table: cities
 * Schema Last Updated: see migration 006_cities_and_offices_city_fk.sql
 *
 * Table Structure:
 *   id UUID PRIMARY KEY
 *   country_id UUID NOT NULL REFERENCES countries(id)
 *   name TEXT NOT NULL
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 *
 * Locality name is scoped to a country; uniqueness of (country_id, name) is enforced in the DB.
 * Rows are typically loaded from seed data; `country_id` must reference an existing country (FK).
 */
// ==================================================================
// 💡 Common DDD rule:
// Entities are mutable, but Value Objects are immutable.
// ==================================================================
// src/backend_lib/modules/core/domain/entities/city.ts

// BaseEntity is the base class for all entities in the domain. It provides common properties and methods for managing domain events, soft deletion, and validation. Each entity must implement its own validation logic by overriding the abstract validate() method. The constructor initializes the entity with an id and timestamps, and calls validation methods to ensure the entity is in a valid state upon creation. Domain events can be added, retrieved, and cleared using the provided methods.
import { BaseEntity } from './base-entity';
// Value Objects — city display name is built from the raw string in the constructor (see constructor comment).
import { CityName } from '../value-objects/city';
// Constants
import { CITY_MESSAGES } from '../constants';
// We have moved the validation logic for the entity ID into the BaseEntity class, since all entities share the same requirements for their IDs (non-empty and UUID-shaped). This promotes code reuse and consistency across all entities. Each entity can still implement its own specific validation logic in the validate() method, but they will all benefit from the shared ID validation logic in the base class.
import { isUuid } from '@/backend_lib/shared/validation';
// We have moved the EntityIdError and ValidationError into the shared exceptions module, since they are common error types that can be used across multiple entities and modules in the application. This promotes better organization and reuse of error types, and keeps our domain entities focused on their specific business logic rather than error handling details. EntityIdError is used for City.id; ValidationError for invalid country_id shape (non-UUID), distinct from missing-entity-id semantics.
import { EntityIdError, ValidationError } from '@/backend_lib/shared/exceptions';

export class City extends BaseEntity<any> {
  public readonly country_id: string;
  public readonly name: CityName;

  /**
   * Accepts primitive strings from the DB, HTTP layer, or seeds — same shape as table columns — and
   * assigns fields in a fixed order so invariants hold:
   *
   * 1. `country_id` — trimmed UUID string referencing `countries.id`.
   * 2. {@link CityName} — built from `nameRaw` (normalized display name).
   *
   * We intentionally do **not** take `public name: CityName` in the parameter list. Callers supply the
   * raw name string from persistence or HTTP; constructing {@link CityName} here keeps validation and
   * normalization in one place (same pattern as {@link Country} for composed value objects).
   *
   * `super(...)` must run first; only then can we assign `this.country_id` and `this.name`.
   */
  constructor(
    public id: string,
    countryIdRaw: string,
    nameRaw: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    super(id, createdAt, updatedAt);
    this.country_id = countryIdRaw.trim();
    this.name = new CityName(nameRaw);
    this.init();
  }

  protected validate(): void {
    // this.init() already runs this.validateId behind the scenes, no need to type it again

    if (!isUuid(this.country_id)) throw new ValidationError(CITY_MESSAGES.COUNTRY_ID_INVALID);
  }
}
