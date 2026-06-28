import {
  PERSON_NAME,
  PERSON_LAST_NAME_MESSAGES,
} from '../../constants';
import { normalize, toPascalCase } from '../../utils/text-formatting';
import { ValidationError } from '@/backend_lib/shared/exceptions';

/**
 * Person last name — normalized for storage and comparison.
 */
export class PersonLastName {
  readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = normalize(value);
  }

  /** @internal Trusted DB hydration only. */
  static fromDatabase(normalizedValue: string): PersonLastName {
    const name = Object.create(PersonLastName.prototype) as PersonLastName;
    (name as { value: string }).value = normalizedValue;
    return name;
  }

  private validate(value: string): void {
    if (!value || value.trim().length < PERSON_NAME.MIN_LENGTH) {
      throw new ValidationError(PERSON_LAST_NAME_MESSAGES.EMPTY);
    }
    if (value.trim().length > PERSON_NAME.MAX_LENGTH) {
      throw new ValidationError(PERSON_LAST_NAME_MESSAGES.TOO_LONG);
    }
  }

  getFormatted(): string {
    return toPascalCase(this.value);
  }

  equals(other: PersonLastName): boolean {
    return this.value === other.value;
  }
}
