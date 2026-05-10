import { OFFICE_NAME, OFFICE_NAME_MESSAGES } from '../../constants';
import { normalize, toPascalCase } from '../../utils/text-formatting';
import { ValidationError } from '@/backend_lib/shared/exceptions';

/**
 * Office display name (e.g. branch or site label), normalized for storage and comparison.
 */
export class OfficeName {
  readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = normalize(value);
  }

  /**
   * @internal Trusted DB hydration only.
   */
  static fromDatabase(normalizedValue: string): OfficeName {
    const name = Object.create(OfficeName.prototype) as OfficeName;
    (name as { value: string }).value = normalizedValue;
    return name;
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new ValidationError(OFFICE_NAME_MESSAGES.EMPTY);
    }
    if (value.trim().length > OFFICE_NAME.MAX_LENGTH) {
      throw new ValidationError(OFFICE_NAME_MESSAGES.TOO_LONG);
    }
  }

  getFormatted(): string {
    return toPascalCase(this.value);
  }

  equals(other: OfficeName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}
