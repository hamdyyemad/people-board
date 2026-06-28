/**
 * Person Entity
 *
 * Database Table: people
 * Schema Last Updated: migration 009_people_city_id.sql (city_id; country via cities join)
 *
 * Table Structure:
 *   id UUID PRIMARY KEY
 *   first_name TEXT NOT NULL
 *   last_name TEXT NOT NULL
 *   email TEXT NOT NULL
 *   phone_number TEXT (nullable)
 *   city_id UUID REFERENCES cities(id) (nullable)
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 *   deleted_at TIMESTAMPTZ
 *
 * Country is not stored on the row: derive via city_id → cities.country_id → countries.
 */
import { BaseEntity } from './base-entity';
import {
  PersonEmail,
  PersonFirstName,
  PersonLastName,
  PersonPhoneNumber,
} from '../value-objects/person';
import { PersonCreatedEvent } from '../events/person/person-created';
import { PERSON_MESSAGES } from '../constants';
import { isUuid } from '@/backend_lib/shared/validation';
import { ValidationError } from '@/backend_lib/shared/exceptions';

export class Person extends BaseEntity<PersonCreatedEvent> {
  public readonly city_id: string | null;

  constructor(
    public id: string,
    public firstName: PersonFirstName,
    public lastName: PersonLastName,
    public email: PersonEmail,
    public phoneNumber: PersonPhoneNumber | null,
    cityIdRaw: string | null,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this.city_id = cityIdRaw?.trim() || null;
    this.init();
  }

  protected validate(): void {
    // this.init() already runs this.validateId behind the scenes, no need to type it again
    
    if (this.city_id !== null && !isUuid(this.city_id)) {
      throw new ValidationError(PERSON_MESSAGES.CITY_ID_INVALID);
    }
  }

  getFullName(): string {
    return `${this.firstName.getFormatted()} ${this.lastName.getFormatted()}`;
  }
}
