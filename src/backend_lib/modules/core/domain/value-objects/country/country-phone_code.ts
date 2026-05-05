import {
  COUNTRY_PHONE_CODE,
  COUNTRY_PHONE_CODE_MESSAGES,
} from '../../constants';
import { getCanonicalPhoneForIso } from '../../constants/countries-dataset';
import { ValidationError } from '@/backend_lib/shared/exceptions';
import { CountryIsoCode } from './country-iso_code';

/**
 * International dialing prefix for a country, validated against
 * `src/backend_lib/shared/data/countries.json` for the given ISO.
 */
export class CountryPhoneCode {
  readonly value: string;

  constructor(iso: CountryIsoCode, raw: string) {
    const expected = getCanonicalPhoneForIso(iso.value);
    this.validate(expected ?? ''); // If the expected phone code is undefined, throw an error
    const normalized = CountryPhoneCode.normalize(raw);
    CountryPhoneCode.assertValidForIso(iso.value, normalized);
    this.value = normalized;
  }

  /**
   * Hydration from DB: still enforces consistency with the given ISO and dataset.
   *
   * @internal
   */
  static fromDatabase(iso: CountryIsoCode, storedNormalized: string): CountryPhoneCode {
    const expected = getCanonicalPhoneForIso(iso.value);
    if (expected === undefined) {
      const normalized = CountryPhoneCode.normalize(storedNormalized);
      const vo = Object.create(CountryPhoneCode.prototype) as CountryPhoneCode;
      (vo as { value: string }).value = normalized;
      return vo;
    }
    if (expected === '') {
      if (storedNormalized.trim().length > 0) {
        throw new ValidationError(COUNTRY_PHONE_CODE_MESSAGES.DOES_NOT_MATCH_ISO);
      }
      const vo = Object.create(CountryPhoneCode.prototype) as CountryPhoneCode;
      (vo as { value: string }).value = '';
      return vo;
    }
    const normalized = CountryPhoneCode.normalize(storedNormalized);
    CountryPhoneCode.assertValidForIso(iso.value, normalized);
    const vo = Object.create(CountryPhoneCode.prototype) as CountryPhoneCode;
    (vo as { value: string }).value = normalized;
    return vo;
  }

  private validate(expected: string): void {
    if (expected === undefined) {
      throw new ValidationError(COUNTRY_PHONE_CODE_MESSAGES.DOES_NOT_MATCH_ISO);
    }
    if (expected === '') {
      throw new ValidationError(COUNTRY_PHONE_CODE_MESSAGES.EMPTY);
    }
    if (expected.length > COUNTRY_PHONE_CODE.MAX_DIGITS_AFTER_PLUS) {
      throw new ValidationError(COUNTRY_PHONE_CODE_MESSAGES.DOES_NOT_MATCH_ISO);
    }
  }
  
  private static normalize(raw: string): string {
    let s = raw.trim().replace(/\s+/g, '');
    if (s.length === 0) {
      throw new ValidationError(COUNTRY_PHONE_CODE_MESSAGES.EMPTY);
    }
    if (s.startsWith('00')) {
      s = `+${s.slice(2)}`;
    }
    if (!s.startsWith('+')) {
      if (/^\d+$/.test(s)) {
        s = `+${s}`;
      } else {
        throw new ValidationError(COUNTRY_PHONE_CODE_MESSAGES.INVALID_FORMAT);
      }
    }
    const digits = s.slice(1);
    if (!/^\d+$/.test(digits)) {
      throw new ValidationError(COUNTRY_PHONE_CODE_MESSAGES.INVALID_FORMAT);
    }
    if (
      digits.length < 1 ||
      digits.length > COUNTRY_PHONE_CODE.MAX_DIGITS_AFTER_PLUS
    ) {
      throw new ValidationError(COUNTRY_PHONE_CODE_MESSAGES.INVALID_FORMAT);
    }
    return `+${digits}`;
  }

  private static assertValidForIso(isoAlpha2: string, normalized: string): void {
    const expected = getCanonicalPhoneForIso(isoAlpha2);
    if (expected === undefined) {
      return;
    }
    if (expected === '') {
      if (normalized !== '') {
        throw new ValidationError(COUNTRY_PHONE_CODE_MESSAGES.DOES_NOT_MATCH_ISO);
      }
      return;
    }
    if (normalized !== expected) {
      throw new ValidationError(COUNTRY_PHONE_CODE_MESSAGES.DOES_NOT_MATCH_ISO);
    }
  }

  static ensureConsistentWithIso(iso: CountryIsoCode, phone: CountryPhoneCode): void {
    CountryPhoneCode.assertValidForIso(iso.value, phone.value);
  }

  equals(other: CountryPhoneCode): boolean {
    return this.value === other.value;
  }
}
