import { IBaseRepository } from './base-repository';

import { Person } from '../../entities/person';
import { CityName } from '../../value-objects/city';
import type { ListingQueryInput } from '@/backend_lib/shared/listing';

/**
 * Person entity enriched with city and country names from joins.
 */
export type PersonWithCityName = Person & {
  cityName?: CityName;
  countryId?: string;
  countryName?: string;
};

export interface IPersonRepository extends IBaseRepository<Person> {
  /**
   * Find a person by email (case-insensitive; email stored normalized).
   */
  findByEmail(email: string, isAudit?: boolean): Promise<Person | null>;

  /**
   * Find a person by normalized phone number.
   */
  findByPhone(phoneNumber: string, isAudit?: boolean): Promise<Person | null>;

  /**
   * List people with pagination, sorting, and filtering.
   * Includes LEFT JOINs to cities and countries for location display.
   */
  findAll(params?: ListingQueryInput, isAudit?: boolean): Promise<PersonWithCityName[]>;

  /**
   * Count people matching the same filters as findAll.
   */
  countAll(params?: ListingQueryInput): Promise<number>;

  /**
   * Find a single person by id with city/country names.
   */
  findById(id: string, isAudit?: boolean): Promise<PersonWithCityName | null>;
}
