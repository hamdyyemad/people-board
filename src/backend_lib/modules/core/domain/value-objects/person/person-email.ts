import { PERSON_EMAIL, PERSON_EMAIL_MESSAGES } from '../../constants';
import { normalize } from '../../utils/text-formatting';
import { ValidationError } from '@/backend_lib/shared/exceptions';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Person email — stored lowercase for case-insensitive uniqueness.
 */
export class PersonEmail {
  readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = normalize(value);
  }

  /** @internal Trusted DB hydration only. */
  static fromDatabase(normalizedValue: string): PersonEmail {
    const email = Object.create(PersonEmail.prototype) as PersonEmail;
    (email as { value: string }).value = normalizedValue;
    return email;
  }

  private validate(value: string): void {
    const trimmed = value?.trim() ?? '';
    if (!trimmed) {
      throw new ValidationError(PERSON_EMAIL_MESSAGES.EMPTY);
    }
    if (trimmed.length > PERSON_EMAIL.MAX_LENGTH) {
      throw new ValidationError(PERSON_EMAIL_MESSAGES.TOO_LONG);
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      throw new ValidationError(PERSON_EMAIL_MESSAGES.INVALID);
    }
  }

  equals(other: PersonEmail): boolean {
    return this.value === other.value;
  }
}
