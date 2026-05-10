import { CITY_NAME, CITY_NAME_MESSAGES } from '../../constants';
import { normalize, toPascalCase } from '../../utils/text-formatting';
import { ValidationError } from '@/backend_lib/shared/exceptions';

/**
 * City display name within a country (normalized for storage and comparison).
 */
export class CityName {
  readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = normalize(value);
  }

  /**
   * @internal Trusted DB / seed hydration only.
   */
  static fromDatabase(normalizedValue: string): CityName {
    const name = Object.create(CityName.prototype) as CityName;
    (name as { value: string }).value = normalizedValue;
    return name;
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new ValidationError(CITY_NAME_MESSAGES.EMPTY);
    }
    if (value.trim().length > CITY_NAME.MAX_LENGTH) {
      throw new ValidationError(CITY_NAME_MESSAGES.TOO_LONG);
    }
  }

  getFormatted(): string {
    return toPascalCase(this.value);
  }

  equals(other: CityName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}
