import { eq } from 'drizzle-orm';
import { DrizzleClient } from '../../../../shared/infrastructure/databases/drizzle-client';
import { citiesTable } from '../databases/tables/cities-table';

// Base repository
import { BaseRepository } from './base-repository';

// Domain
import { ICityRepository, type CityMinimal } from '../../domain/ports/repositories/city-repository';
import { City } from '../../domain/entities/city';

export class CityRepository extends BaseRepository<City> implements ICityRepository {
  protected table = citiesTable;

  async findById(cityId: string): Promise<City | null> {
    const result = await DrizzleClient
      .select()
      .from(citiesTable)
      .where(eq(citiesTable.id, cityId))
      .limit(1);

    if (!result.length) return null;

    return this.toDomain(result[0]);
  }

  async findCityByIdMinimal(cityId: string): Promise<CityMinimal | null> {
    const result = await DrizzleClient
      .select({ name: citiesTable.name })
      .from(citiesTable)
      .where(eq(citiesTable.id, cityId))
      .limit(1);

    if (!result.length) return null;

    return { name: result[0].name };
  }

  protected toPersistence(city: City): any {
    return {
      id: city.id,
      countryId: city.country_id,
      name: city.name.value,
      createdAt: city.createdAt,
      updatedAt: city.updatedAt,
    };
  }

  protected toDomain(row: any): City {
    return new City(
      row.id,
      row.countryId,
      row.name,
      row.createdAt,
      row.updatedAt
    );
  }
}
