import { eq, isNull, and, count, ilike, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { DrizzleClient } from '../../../../shared/infrastructure/databases/drizzle-client';
import { officesTable } from '../databases/tables/offices-table';
import { citiesTable } from '../databases/tables/cities-table';

// Base repository
import { BaseRepository } from './base-repository';

// Domain
import { IOfficeRepository, type OfficeWithCountryName } from '../../domain/ports/repositories/office-repository';
import { Office } from '../../domain/entities/office';
import { OfficeName } from '../../domain/value-objects/office';
import { CityName } from '../../domain/value-objects/city';

// DTOs
import type { ListingQueryInput } from '../../../../shared/listing';

// We alias cities for the city join
const cityAlias = alias(citiesTable, 'city');

// Inline countries table — no countries-table file yet
import { pgTable, uuid, text } from 'drizzle-orm/pg-core';
const countriesTable = pgTable('countries', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
});
const countryAlias = alias(countriesTable, 'country');

export class OfficeRepository extends BaseRepository<Office> implements IOfficeRepository {
  protected table = officesTable;

  protected resolveColumn(field: string): any {
    if (field === 'cityName') return cityAlias.name;
    return super.resolveColumn(field);
  }

  private get projection() {
    return {
      id: officesTable.id,
      name: officesTable.name,
      cityId: officesTable.cityId,
      cityName: cityAlias.name,
      countryId: countryAlias.id,
      countryName: countryAlias.name,
      isActive: officesTable.isActive,
      address: officesTable.address,
      latitude: officesTable.latitude,
      longitude: officesTable.longitude,
      createdAt: officesTable.createdAt,
      updatedAt: officesTable.updatedAt,
      deletedAt: officesTable.deletedAt,
    };
  }

  async findById(id: string, isAudit: boolean = false): Promise<OfficeWithCountryName | null> {
    const whereCondition = !isAudit
      ? and(eq(officesTable.id, id), isNull(officesTable.deletedAt))
      : eq(officesTable.id, id);

    const result = await DrizzleClient
      .select(this.projection)
      .from(officesTable)
      .leftJoin(cityAlias, eq(officesTable.cityId, cityAlias.id))
      .leftJoin(countryAlias, eq(cityAlias.countryId, countryAlias.id))
      .where(whereCondition)
      .limit(1);

    if (!result.length) return null;

    return this.toDomainWithCity(result[0]);
  }

  async findAll(params?: ListingQueryInput, isAudit: boolean = false): Promise<OfficeWithCountryName[]> {
    if (!params) {
      const result = await DrizzleClient
        .select(this.projection)
        .from(officesTable)
        .leftJoin(cityAlias, eq(officesTable.cityId, cityAlias.id))
        .leftJoin(countryAlias, eq(cityAlias.countryId, countryAlias.id))
        .where(isAudit ? undefined : isNull(officesTable.deletedAt));
      return result.map((row: any) => this.toDomainWithCity(row));
    }

    const { where, orderBy, limit } = this.buildListQuery(params, isAudit);

    if (params.filters) {
      for (const f of params.filters) {
        if (f.field === 'city_id' && f.op === 'eq' && typeof f.value === 'string') {
          where.push(eq(officesTable.cityId, f.value));
        }
        if (f.field === 'country_id' && f.op === 'eq' && typeof f.value === 'string') {
          where.push(eq(cityAlias.countryId, f.value));
        }
        if (f.field === 'name' && f.op === 'contains' && typeof f.value === 'string' && f.value.length > 0) {
          where.push(ilike(officesTable.name, `%${f.value}%`));
        }
      }
    }

    const result = await DrizzleClient
      .select(this.projection)
      .from(officesTable)
      .leftJoin(cityAlias, eq(officesTable.cityId, cityAlias.id))
      .leftJoin(countryAlias, eq(cityAlias.countryId, countryAlias.id))
      .where(where.length > 0 ? and(...where) : undefined)
      .orderBy(...orderBy)
      .limit(limit);

    return result.map((row: any) => this.toDomainWithCity(row));
  }

  async findByCountryId(countryId: string): Promise<OfficeWithCountryName[]> {
    const result = await DrizzleClient
      .select(this.projection)
      .from(officesTable)
      .leftJoin(cityAlias, eq(officesTable.cityId, cityAlias.id))
      .leftJoin(countryAlias, eq(cityAlias.countryId, countryAlias.id))
      .where(and(eq(cityAlias.countryId, countryId), isNull(officesTable.deletedAt)));

    return result.map((row: any) => this.toDomainWithCity(row));
  }

  async countAll(params?: ListingQueryInput): Promise<number> {
    const conditions = [isNull(officesTable.deletedAt)];
    let needsCityJoin = false;

    if (params?.filters) {
      for (const f of params.filters) {
        if (f.field === 'city_id' && f.op === 'eq' && typeof f.value === 'string') {
          conditions.push(eq(officesTable.cityId, f.value));
        }
        if (f.field === 'country_id' && f.op === 'eq' && typeof f.value === 'string') {
          conditions.push(eq(cityAlias.countryId, f.value));
          needsCityJoin = true;
        }
        if (f.field === 'name' && f.op === 'contains' && typeof f.value === 'string' && f.value.length > 0) {
          conditions.push(ilike(officesTable.name, `%${f.value}%`));
        }
      }
    }

    const query = DrizzleClient
      .select({ total: count() })
      .from(officesTable);

    if (needsCityJoin) {
      const result = await query
        .leftJoin(cityAlias, eq(officesTable.cityId, cityAlias.id))
        .where(and(...conditions));
      return result[0]?.total ?? 0;
    }

    const result = await query.where(and(...conditions));
    return result[0]?.total ?? 0;
  }

  async findOfficeByAddress(address: string): Promise<OfficeWithCountryName | null> {
    const result = await DrizzleClient
      .select()
      .from(officesTable)
      .leftJoin(cityAlias, eq(officesTable.cityId, cityAlias.id))
      .where(and(eq(officesTable.address, address), isNull(officesTable.deletedAt)))
      .limit(1);

    if (!result.length) return null;

    return this.toDomainWithCity(result[0]);
  }

  async findOfficeByCoordinates(latitude: string, longitude: string): Promise<OfficeWithCountryName | null> {
    const result = await DrizzleClient
      .select()
      .from(officesTable)
      .leftJoin(cityAlias, eq(officesTable.cityId, cityAlias.id))
      .where(
        and(
          eq(officesTable.latitude, latitude),
          eq(officesTable.longitude, longitude),
          isNull(officesTable.deletedAt)
        )
      )
      .limit(1);

    if (!result.length) return null;

    return this.toDomainWithCity(result[0]);
  }

  protected toPersistence(office: Office): any {
    return {
      id: office.id,
      name: office.name.value,
      cityId: office.city_id,
      isActive: office.is_active,
      address: office.address.value ?? null,
      latitude: office.coordinates.latitude ?? null,
      longitude: office.coordinates.longitude ?? null,
      createdAt: office.createdAt,
      updatedAt: office.updatedAt,
      deletedAt: office.deletedAt,
    };
  }

  protected toDomain(row: any): Office {
    return new Office(
      row.id,
      OfficeName.fromDatabase(row.name),
      row.cityId,
      row.address ?? null,
      row.latitude ?? null,
      row.longitude ?? null,
      row.isActive ?? true,
      row.createdAt,
      row.updatedAt,
      row.deletedAt ?? null
    );
  }

  private toDomainWithCity(row: any): OfficeWithCountryName {
    const office = this.toDomain(row);
    return Object.assign(office, {
      cityName: row.cityName ? CityName.fromDatabase(row.cityName) : undefined,
      countryId: row.countryId ?? undefined,
      countryName: row.countryName ?? undefined,
    }) as OfficeWithCountryName;
  }
}
