// Base Repository
import { IBaseRepository } from './base-repository';

// Domain
import { City } from '../../entities/city';

/**
 * Minimal city data structure containing only the name.
 * Used for lightweight queries when full City entity is not needed.
 * Does NOT include the entire City object.
 */
export type CityMinimal = { name: string };

export interface ICityRepository extends IBaseRepository<City> {
  /**
   * Find a city by its unique identifier.
   * Returns the complete City entity with all properties.
   * 
   * @param cityId - The UUID of the city to retrieve
   * @returns The full City entity, or null if not found
   */
  findById(cityId: string): Promise<City | null>;

  /**
   * Find a city by its unique identifier and return only minimal data.
   * Returns ONLY the city name, NOT the entire City object.
   * Use this for performance optimization when only the name is needed.
   * 
   * @param cityId - The UUID of the city to retrieve
   * @returns Object containing only the city name, or null if not found
   */
  findCityByIdMinimal(cityId: string): Promise<CityMinimal | null>;
}