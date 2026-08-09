import { EMPLOYEE_NO, EMPLOYEE_NO_MESSAGES } from '../../constants/employee';
import { ValidationError } from '@/backend_lib/shared/exceptions';

/**
 * Auto-assigned integer employee number (1, 2, 3…). Set by DB on INSERT; not accepted from API.
 */
export class EmployeeNo {
  readonly value: number;

  constructor(value: number) {
    this.validate(value);
    this.value = value;
  }

  /** @internal Trusted DB hydration only. */
  static fromDatabase(storedValue: number): EmployeeNo {
    const no = Object.create(EmployeeNo.prototype) as EmployeeNo;
    (no as { value: number }).value = storedValue;
    return no;
  }

  static fromNullable(value: number | null | undefined): EmployeeNo | null {
    if (value === null || value === undefined) {
      return null;
    }
    return new EmployeeNo(value);
  }

  private validate(value: number): void {
    if (!Number.isInteger(value) || value < EMPLOYEE_NO.MIN) {
      throw new ValidationError(EMPLOYEE_NO_MESSAGES.INVALID);
    }
  }

  equals(other: EmployeeNo): boolean {
    return this.value === other.value;
  }
}
