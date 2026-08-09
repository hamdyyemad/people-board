import { PERSON_PHONE, PERSON_PHONE_MESSAGES } from '../../constants';
import { normalizePhone } from '../../utils/phone-formatting';
import { ValidationError } from '@/backend_lib/shared/exceptions';

const PHONE_PATTERN = /^[+]?[\d\s().-]+$/;

/**
 * Optional person phone number. Nullable at entity level; use {@link fromNullable} when hydrating.
 */
export class PersonPhoneNumber {
  readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = normalizePhone(value);
  }

  /** @internal Trusted DB hydration only. */
  static fromDatabase(storedValue: string): PersonPhoneNumber {
    const phone = Object.create(PersonPhoneNumber.prototype) as PersonPhoneNumber;
    (phone as { value: string }).value = storedValue;
    return phone;
  }

  static fromNullable(value: string | null | undefined): PersonPhoneNumber | null {
    if (value === null || value === undefined || value.trim() === '') {
      return null;
    }
    return new PersonPhoneNumber(value);
  }

  private validate(value: string): void {
    const trimmed = value?.trim() ?? '';
    if (trimmed.length < PERSON_PHONE.MIN_LENGTH) {
      throw new ValidationError(PERSON_PHONE_MESSAGES.TOO_SHORT);
    }
    if (trimmed.length > PERSON_PHONE.MAX_LENGTH) {
      throw new ValidationError(PERSON_PHONE_MESSAGES.TOO_LONG);
    }
    if (!PHONE_PATTERN.test(trimmed)) {
      throw new ValidationError(PERSON_PHONE_MESSAGES.INVALID);
    }
  }

  equals(other: PersonPhoneNumber): boolean {
    return this.value === other.value;
  }
}
