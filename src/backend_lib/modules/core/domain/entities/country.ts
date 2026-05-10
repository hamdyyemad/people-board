/**
 * Country Entity
 *
 * Database Table: countries
 * Schema Last Updated: 2026-03-11 (migration 001_initial_schema.sql)
 *
 * Table Structure:
 *   id UUID PRIMARY KEY
 *   iso_code CHAR(2) UNIQUE NOT NULL
 *   name TEXT NOT NULL
 *   phone_code TEXT NOT NULL
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 *
 * Reference data is validated against `src/backend_lib/shared/data/countries.json`
 * via value objects (ISO, dialing prefix, display name must agree for that row).
 */
// ==================================================================
// 💡 Common DDD rule:
// Entities are mutable, but Value Objects are immutable.
// ==================================================================
// src/backend_lib/modules/core/domain/entities/country.ts

// BaseEntity is the base class for all entities in the domain. It provides common properties and methods for managing domain events, soft deletion, and validation. Each entity must implement its own validation logic by overriding the abstract validate() method. The constructor initializes the entity with an id and timestamps, and calls validation methods to ensure the entity is in a valid state upon creation. Domain events can be added, retrieved, and cleared using the provided methods.
import { BaseEntity } from './base-entity';
// Value Objects — ISO, phone prefix, and name are composed in order inside the constructor (see constructor comment).
import { CountryIsoCode, CountryName, CountryPhoneCode } from '../value-objects/country';
// Constants
import { COUNTRY_MESSAGES } from '../constants';
// We have moved the validation logic for the entity ID into the BaseEntity class, since all entities share the same requirements for their IDs (non-empty and UUID-shaped). This promotes code reuse and consistency across all entities. Each entity can still implement its own specific validation logic in the validate() method, but they will all benefit from the shared ID validation logic in the base class.
import { isUuid } from '@/backend_lib/shared/validation';
// We have moved the EntityIdError into the shared exceptions module, since it is a common error type that can be used across multiple entities and modules in the application. This promotes better organization and reuse of error types, and keeps our domain entities focused on their specific business logic rather than error handling details.
import { EntityIdError } from '@/backend_lib/shared/exceptions';

export class Country extends BaseEntity<any> {
  public readonly iso_code: CountryIsoCode;
  public readonly phone_code: CountryPhoneCode;
  public readonly name: CountryName;

  /**
   * Accepts primitive strings from the DB, HTTP layer, or seeds — same shape as table / JSON columns — and
   * builds value objects in a fixed order so invariants hold:
   *
   * 1. {@link CountryIsoCode} — validates format and that the code exists in `countries.json`.
   * 2. {@link CountryPhoneCode} — requires the ISO above; checks the prefix matches that country in `countries.json`.
   * 3. {@link CountryName} — requires ISO + phone; checks the name matches that country in `countries.json`.
   *
   * We intentionally do **not** take `public iso_code: CountryIsoCode, public phone_code: CountryPhoneCode, ...`
   * in the parameter list. Callers would have to construct those VOs themselves, which invites inconsistent
   * combinations (e.g. `CountryIsoCode('EG')` with a `CountryPhoneCode` built for another ISO, or a name that
   * does not match the dataset). Keeping raw strings here makes the entity the single place that enforces
   * ISO → phone → name composition and cross-checks against the dataset.
   *
   * `super(...)` must run first; only then can we assign `this.iso_code` and derive phone and name from it.
   */
  constructor(
    public id: string,
    isoCodeRaw: string,
    phoneCodeRaw: string,
    nameRaw: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    super(id, createdAt, updatedAt);
    this.iso_code = new CountryIsoCode(isoCodeRaw);
    this.phone_code = new CountryPhoneCode(this.iso_code, phoneCodeRaw);
    this.name = new CountryName(this.iso_code, this.phone_code, nameRaw);
    this.init();
  }

  protected validate(): void {
    // this.init() already runs this.validateId behind the scenes, no need to type it again
    
    if (!isUuid(this.id)) throw new EntityIdError(COUNTRY_MESSAGES.ID_NOT_FOUND);
  }
}
