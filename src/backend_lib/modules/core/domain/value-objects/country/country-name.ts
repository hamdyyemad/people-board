import {
  COUNTRY_NAME,
  COUNTRY_NAME_MESSAGES,
} from '../../constants';
import { getCanonicalNameForIso } from '../../constants/countries-dataset';
import { normalize, toPascalCase } from '../../utils/text-formatting';
import { ValidationError } from '@/backend_lib/shared/exceptions';
import { CountryIsoCode } from './country-iso_code';
import { CountryPhoneCode } from './country-phone_code';

/**
 * Country display name, normalized for storage and comparison.
 *
 * Must be constructed **after** {@link CountryIsoCode} and {@link CountryPhoneCode}:
 * the dialing prefix is checked against the ISO, then the name is checked against
 * the canonical display name from `src/backend_lib/shared/data/countries.json`.
 */
export class CountryName {
  readonly value: string;

  constructor(iso: CountryIsoCode, phone: CountryPhoneCode, raw: string) {
    CountryPhoneCode.ensureConsistentWithIso(iso, phone);
    this.validate(raw);
    const normalized = normalize(raw);
    CountryName.assertNameMatchesIso(iso.value, normalized);
    this.value = normalized;
  }

  /**
   * Hydration from DB: still enforces ISO ↔ phone ↔ name consistency.
   *
   * @internal
   */
  static fromDatabase(
    iso: CountryIsoCode,
    phone: CountryPhoneCode,
    normalizedValue: string
  ): CountryName {
    CountryPhoneCode.ensureConsistentWithIso(iso, phone);
    const normalized = normalize(normalizedValue);
    if (!normalized || normalized.length === 0) {
      throw new ValidationError(COUNTRY_NAME_MESSAGES.EMPTY);
    }
    if (normalized.length > COUNTRY_NAME.MAX_LENGTH) {
      throw new ValidationError(COUNTRY_NAME_MESSAGES.TOO_LONG);
    }
    CountryName.assertNameMatchesIso(iso.value, normalized);
    const name = Object.create(CountryName.prototype) as CountryName;
    (name as { value: string }).value = normalized;
    return name;
  }

  private static assertNameMatchesIso(isoAlpha2: string, normalizedName: string): void {
    const canonical = getCanonicalNameForIso(isoAlpha2);
    if (canonical === undefined) {
      return;
    }
    if (normalizedName !== canonical) {
      throw new ValidationError(COUNTRY_NAME_MESSAGES.DOES_NOT_MATCH_ISO);
    }
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new ValidationError(COUNTRY_NAME_MESSAGES.EMPTY);
    }
    if (value.trim().length > COUNTRY_NAME.MAX_LENGTH) {
      throw new ValidationError(COUNTRY_NAME_MESSAGES.TOO_LONG);
    }
  }

  getFormatted(): string {
    return toPascalCase(this.value);
  }

  equals(other: CountryName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}
