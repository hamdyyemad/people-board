import {
  COUNTRY_ISO_CODE,
  COUNTRY_ISO_CODE_MESSAGES,
} from '../../constants';
import { getCountryDatasetEntry } from '../../constants/countries-dataset';
import { ValidationError } from '@/backend_lib/shared/exceptions';

/**
 * ISO 3166-1 alpha-2 country code (two letters, stored uppercase).
 */
export class CountryIsoCode {
  readonly value: string;

  constructor(raw: string) {
    this.value = CountryIsoCode.normalize(raw);
    this.validate(this.value);
  }

  /**
   * Hydration from DB or other trusted source (already uppercase alpha-2).
   *
   * @internal
   */
  static fromDatabase(value: string): CountryIsoCode {
    const normalized = CountryIsoCode.normalize(value);
    const vo = Object.create(CountryIsoCode.prototype) as CountryIsoCode;
    (vo as { value: string }).value = normalized;
    vo.validate(normalized);
    return vo;
  }

  private static normalize(raw: string): string {
    return raw.trim().toUpperCase();
  }

  private validate(value: string): void {
    if (value.length !== COUNTRY_ISO_CODE.LENGTH) {
      throw new ValidationError(COUNTRY_ISO_CODE_MESSAGES.INVALID);
    }
    if (!/^[A-Z]{2}$/.test(value)) {
      throw new ValidationError(COUNTRY_ISO_CODE_MESSAGES.INVALID);
    }
    if (!getCountryDatasetEntry(value)) {
      throw new ValidationError(COUNTRY_ISO_CODE_MESSAGES.NOT_IN_DATASET);
    }
  }

  equals(other: CountryIsoCode): boolean {
    return this.value === other.value;
  }
}
