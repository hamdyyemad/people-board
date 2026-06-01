// Base Repository
import { IBaseRepository } from './base-repository';

// Domain
import { Office } from '../../entities/office';
import { CityName } from '../../value-objects/city';

// DTOs
import { type ListingQueryInput } from '@/backend_lib/shared/listing/listing-query-builder';

/**
 * Office entity enriched with city and country names.
 * Used for queries that join with cities and countries tables.
 */
export type OfficeWithCountryName = Office & {
  cityName?: CityName;
  countryId?: string;
  countryName?: string;
};

export interface IOfficeRepository extends IBaseRepository<Office> {
  /**
   * Find all offices located in a specific country.
   * Queries via offices -> cities -> countries relationship chain.
   * Returns offices with both city and country names populated.
   * 
   * @param countryId - The UUID of the country to filter by
   * @returns Array of offices in the specified country, with city and country names
   * @note Uses two-level JOIN: offices → cities → countries
   */
  findByCountryId(countryId: string): Promise<OfficeWithCountryName[]>;

  /**
   * Find all offices with pagination, sorting, and filtering support.
   * Includes LEFT JOINs to cities and countries tables for location names.
   * Supports cursor-based pagination for efficient large dataset navigation.
   * 
   * @param params - Optional query parameters for pagination, sorting, and filtering
   * @param isAudit - If true, includes soft-deleted offices. Default: false
   * @returns Array of offices (limit+1 for cursor), each with city and country names if available
   */
  findAll(params?: ListingQueryInput, isAudit?: boolean): Promise<OfficeWithCountryName[]>;

  /**
   * Count total number of offices matching the same filters as findAll.
   * Ignores pagination parameters (cursor, limit, sort) and returns total count.
   * Used for displaying total records in paginated UI.
   * 
   * @param params - Optional query parameters for filtering (pagination ignored)
   * @returns Total count of non-deleted offices matching the filters
   */
  countAll(params?: ListingQueryInput): Promise<number>;

  /**
   * Find an office by its physical address.
   * Performs exact match on the address field.
   * Returns office with city and country names populated.
   * 
   * @param address - The physical address to search for
   * @returns The office with matching address and location names, or null if not found
   */
  findOfficeByAddress(address: string): Promise<OfficeWithCountryName | null>;

  /**
   * Find an office by its GPS coordinates.
   * Performs exact match on latitude and longitude.
   * Useful for location-based queries and duplicate detection.
   * 
   * @param latitude - The latitude coordinate (WGS 84 decimal degrees)
   * @param longitude - The longitude coordinate (WGS 84 decimal degrees)
   * @returns The office at the specified coordinates with location names, or null if not found
   */
  findOfficeByCoordinates(latitude: string, longitude: string): Promise<OfficeWithCountryName | null>;

  /**
   * Find a single office by its unique identifier.
   * Overrides base implementation to include LEFT JOINs for city and country names.
   * Uses projection to return only necessary fields (cityId, cityName, countryName).
   * Does NOT return the entire City or Country objects, only their names.
   * 
   * @param id - The UUID of the office to retrieve
   * @param isAudit - If true, includes soft-deleted offices. Default: false
   * @returns The office with city and country names, or null if not found
   */
  findById(id: string, isAudit?: boolean): Promise<OfficeWithCountryName | null>;
}