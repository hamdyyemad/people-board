import { OFFICE_ADDRESS, OFFICE_ADDRESS_MESSAGES } from '../../constants';
import { ValidationError } from '@/backend_lib/shared/exceptions';

/**
 * Free-text street / mailing address for an office. `value` is `null` when unknown or remote-only.
 */
export class OfficeAddress {
  readonly value: string | null;

  constructor(raw: string | null) {
    this.value = OfficeAddress.normalize(raw);
    this.validate(this.value);
  }

  /**
   * @internal Trusted DB hydration only.
   */
  static fromDatabase(stored: string | null): OfficeAddress {
    return new OfficeAddress(stored);
  }

  private static normalize(raw: string | null): string | null {
    if (raw == null) return null;
    const t = raw.trim();
    return t.length === 0 ? null : t;
  }

  private validate(value: string | null): void {
    if (value != null && value.length > OFFICE_ADDRESS.MAX_LENGTH) {
      throw new ValidationError(OFFICE_ADDRESS_MESSAGES.TOO_LONG);
    }
  }

  isEmpty(): boolean {
    return this.value == null;
  }

  equals(other: OfficeAddress): boolean {
    return this.value === other.value;
  }
}
