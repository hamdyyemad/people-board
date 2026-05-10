import { OFFICE_COORDINATES_MESSAGES } from '../../constants';
import { ValidationError } from '@/backend_lib/shared/exceptions';

/**
 * WGS 84 decimal degrees as trimmed strings (aligns with `NUMERIC` latitude/longitude columns).
 * Either both `latitude` and `longitude` are set, or both are `null`.
 *
 * Valid ranges: latitude ∈ [-90, 90] (poles), longitude ∈ [-180, 180] (east/west of prime meridian).
 */
export class OfficeCoordinates {
  readonly latitude: string | null;
  readonly longitude: string | null;

  constructor(latitudeRaw: string | null, longitudeRaw: string | null) {
    this.latitude = OfficeCoordinates.normalizeComponent(latitudeRaw);
    this.longitude = OfficeCoordinates.normalizeComponent(longitudeRaw);
    this.validate(this.latitude, this.longitude);
  }

  /**
   * @internal Trusted DB hydration only.
   */
  static fromDatabase(
    latitudeStored: string | null,
    longitudeStored: string | null
  ): OfficeCoordinates {
    return new OfficeCoordinates(latitudeStored, longitudeStored);
  }

  private static normalizeComponent(raw: string | null): string | null {
    if (raw == null) return null;
    const t = raw.trim();
    return t.length === 0 ? null : t;
  }

  private validate(lat: string | null, lon: string | null): void {
    const hasLat = lat != null;
    const hasLon = lon != null;
    if (hasLat !== hasLon) {
      throw new ValidationError(OFFICE_COORDINATES_MESSAGES.LAT_LON_PAIR);
    }
    if (!hasLat || lat == null || lon == null) {
      return;
    }
    const latN = Number(lat);
    const lonN = Number(lon);
    if (Number.isNaN(latN)) {
      throw new ValidationError(OFFICE_COORDINATES_MESSAGES.LATITUDE_INVALID);
    }
    if (Number.isNaN(lonN)) {
      throw new ValidationError(OFFICE_COORDINATES_MESSAGES.LONGITUDE_INVALID);
    }
    // Latitude: how far north/south from the equator. The poles are at ±90° — there is
    // nothing “more north” than the North Pole or “more south” than the South Pole, so
    // any value outside [-90, 90] cannot be a real point on Earth in WGS-84.
    if (latN < -90 || latN > 90) {
      throw new ValidationError(OFFICE_COORDINATES_MESSAGES.LATITUDE_RANGE);
    }
    // Longitude: how far east/west from the prime meridian. A full turn is 360°; by
    // convention we use half on each side, so valid decimal degrees are in [-180, 180].
    if (lonN < -180 || lonN > 180) {
      throw new ValidationError(OFFICE_COORDINATES_MESSAGES.LONGITUDE_RANGE);
    }
  }

  isPresent(): boolean {
    return this.latitude != null && this.longitude != null;
  }

  equals(other: OfficeCoordinates): boolean {
    return this.latitude === other.latitude && this.longitude === other.longitude;
  }
}
