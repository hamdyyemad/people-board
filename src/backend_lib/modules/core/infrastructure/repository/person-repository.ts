import { eq, isNull, and, count, ilike } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { DrizzleClient } from '../../../../shared/infrastructure/databases/drizzle-client';
import { peopleTable } from '../databases/tables/people-table';
import { citiesTable } from '../databases/tables/cities-table';

import { BaseRepository } from './base-repository';

import {
  IPersonRepository,
  type PersonWithCityName,
} from '../../domain/ports/repositories/person-repository';
import { Person } from '../../domain/entities/person';
import {
  PersonEmail,
  PersonFirstName,
  PersonLastName,
  PersonPhoneNumber,
} from '../../domain/value-objects/person';
import { CityName } from '../../domain/value-objects/city';
import { normalize } from '../../domain/utils/text-formatting';
import { normalizePhone } from '../../domain/utils/phone-formatting';

import type { ListingQueryInput } from '../../../../shared/listing';

import { pgTable, uuid, text } from 'drizzle-orm/pg-core';

const cityAlias = alias(citiesTable, 'city');

const countriesTable = pgTable('countries', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
});
const countryAlias = alias(countriesTable, 'country');

export class PersonRepository extends BaseRepository<Person> implements IPersonRepository {
  protected table = peopleTable;

  protected resolveColumn(field: string): any {
    if (field === 'firstName') return peopleTable.firstName;
    if (field === 'lastName') return peopleTable.lastName;
    if (field === 'email') return peopleTable.email;
    if (field === 'cityName') return cityAlias.name;
    return super.resolveColumn(field);
  }

  private get projection() {
    return {
      id: peopleTable.id,
      firstName: peopleTable.firstName,
      lastName: peopleTable.lastName,
      email: peopleTable.email,
      phoneNumber: peopleTable.phoneNumber,
      cityId: peopleTable.cityId,
      cityName: cityAlias.name,
      countryId: countryAlias.id,
      countryName: countryAlias.name,
      createdAt: peopleTable.createdAt,
      updatedAt: peopleTable.updatedAt,
      deletedAt: peopleTable.deletedAt,
    };
  }

  /**
   * People have no single `name` column — use {@link findByEmail} instead.
   */
  async findByName(_name: string, _isAudit: boolean = false): Promise<Person | null> {
    return null;
  }

  async findByEmail(email: string, isAudit: boolean = false): Promise<Person | null> {
    const normalized = normalize(email);
    const whereCondition = !isAudit
      ? and(eq(peopleTable.email, normalized), isNull(peopleTable.deletedAt))
      : eq(peopleTable.email, normalized);

    const result = await DrizzleClient
      .select()
      .from(peopleTable)
      .where(whereCondition)
      .limit(1);

    if (!result.length) return null;

    return this.toDomain(result[0]);
  }

  async findByPhone(phoneNumber: string, isAudit: boolean = false): Promise<Person | null> {
    const normalized = normalizePhone(phoneNumber);
    const whereCondition = !isAudit
      ? and(eq(peopleTable.phoneNumber, normalized), isNull(peopleTable.deletedAt))
      : eq(peopleTable.phoneNumber, normalized);

    const result = await DrizzleClient
      .select()
      .from(peopleTable)
      .where(whereCondition)
      .limit(1);

    if (!result.length) return null;

    return this.toDomain(result[0]);
  }

  async findById(id: string, isAudit: boolean = false): Promise<PersonWithCityName | null> {
    const whereCondition = !isAudit
      ? and(eq(peopleTable.id, id), isNull(peopleTable.deletedAt))
      : eq(peopleTable.id, id);

    const result = await DrizzleClient
      .select(this.projection)
      .from(peopleTable)
      .leftJoin(cityAlias, eq(peopleTable.cityId, cityAlias.id))
      .leftJoin(countryAlias, eq(cityAlias.countryId, countryAlias.id))
      .where(whereCondition)
      .limit(1);

    if (!result.length) return null;

    return this.toDomainWithCity(result[0]);
  }

  async findAll(params?: ListingQueryInput, isAudit: boolean = false): Promise<PersonWithCityName[]> {
    if (!params) {
      const result = await DrizzleClient
        .select(this.projection)
        .from(peopleTable)
        .leftJoin(cityAlias, eq(peopleTable.cityId, cityAlias.id))
        .leftJoin(countryAlias, eq(cityAlias.countryId, countryAlias.id))
        .where(isAudit ? undefined : isNull(peopleTable.deletedAt));

      return result.map((row) => this.toDomainWithCity(row));
    }

    const { where, orderBy, limit } = this.buildListQuery(params, isAudit);

    if (params.filters) {
      for (const f of params.filters) {
        if (f.field === 'city_id' && f.op === 'eq' && typeof f.value === 'string') {
          where.push(eq(peopleTable.cityId, f.value));
        }
        if (f.field === 'country_id' && f.op === 'eq' && typeof f.value === 'string') {
          where.push(eq(cityAlias.countryId, f.value));
        }
        if (f.field === 'email' && f.op === 'contains' && typeof f.value === 'string' && f.value.length > 0) {
          where.push(ilike(peopleTable.email, `%${normalize(f.value)}%`));
        }
        if (f.field === 'first_name' && f.op === 'contains' && typeof f.value === 'string' && f.value.length > 0) {
          where.push(ilike(peopleTable.firstName, `%${normalize(f.value)}%`));
        }
        if (f.field === 'last_name' && f.op === 'contains' && typeof f.value === 'string' && f.value.length > 0) {
          where.push(ilike(peopleTable.lastName, `%${normalize(f.value)}%`));
        }
      }
    }

    const result = await DrizzleClient
      .select(this.projection)
      .from(peopleTable)
      .leftJoin(cityAlias, eq(peopleTable.cityId, cityAlias.id))
      .leftJoin(countryAlias, eq(cityAlias.countryId, countryAlias.id))
      .where(where.length > 0 ? and(...where) : undefined)
      .orderBy(...orderBy)
      .limit(limit);

    return result.map((row) => this.toDomainWithCity(row));
  }

  async countAll(params?: ListingQueryInput): Promise<number> {
    const conditions = [isNull(peopleTable.deletedAt)];
    let needsCityJoin = false;

    if (params?.filters) {
      for (const f of params.filters) {
        if (f.field === 'city_id' && f.op === 'eq' && typeof f.value === 'string') {
          conditions.push(eq(peopleTable.cityId, f.value));
        }
        if (f.field === 'country_id' && f.op === 'eq' && typeof f.value === 'string') {
          conditions.push(eq(cityAlias.countryId, f.value));
          needsCityJoin = true;
        }
        if (f.field === 'email' && f.op === 'contains' && typeof f.value === 'string' && f.value.length > 0) {
          conditions.push(ilike(peopleTable.email, `%${normalize(f.value)}%`));
        }
        if (f.field === 'first_name' && f.op === 'contains' && typeof f.value === 'string' && f.value.length > 0) {
          conditions.push(ilike(peopleTable.firstName, `%${normalize(f.value)}%`));
        }
        if (f.field === 'last_name' && f.op === 'contains' && typeof f.value === 'string' && f.value.length > 0) {
          conditions.push(ilike(peopleTable.lastName, `%${normalize(f.value)}%`));
        }
      }
    }

    const query = DrizzleClient.select({ total: count() }).from(peopleTable);

    if (needsCityJoin) {
      const result = await query
        .leftJoin(cityAlias, eq(peopleTable.cityId, cityAlias.id))
        .where(and(...conditions));
      return result[0]?.total ?? 0;
    }

    const result = await query.where(and(...conditions));
    return result[0]?.total ?? 0;
  }

  protected toPersistence(person: Person): any {
    return {
      id: person.id,
      firstName: person.firstName.value,
      lastName: person.lastName.value,
      email: person.email?.value ?? null,
      phoneNumber: person.phoneNumber?.value ?? null,
      cityId: person.city_id,
      createdAt: person.createdAt,
      updatedAt: person.updatedAt,
      deletedAt: person.deletedAt,
    };
  }

  protected toDomain(row: any): Person {
    return new Person(
      row.id,
      PersonFirstName.fromDatabase(row.firstName),
      PersonLastName.fromDatabase(row.lastName),
      PersonEmail.fromNullable(row.email),
      PersonPhoneNumber.fromNullable(row.phoneNumber),
      row.cityId ?? null,
      row.createdAt,
      row.updatedAt,
      row.deletedAt ?? null
    );
  }

  private toDomainWithCity(row: any): PersonWithCityName {
    const person = this.toDomain(row);
    return Object.assign(person, {
      cityName: row.cityName ? CityName.fromDatabase(row.cityName) : undefined,
      countryId: row.countryId ?? undefined,
      countryName: row.countryName ?? undefined,
    }) as PersonWithCityName;
  }
}
