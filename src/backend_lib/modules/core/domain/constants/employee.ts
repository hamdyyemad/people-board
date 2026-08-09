/**
 * Employee domain constants.
 * Aligns with DB enums: employee_status, work_type, record_origin_type (migration 001).
 */

export const EMPLOYEE_STATUSES = [
  'onboarding',
  'probation',
  'active',
  'on_leave',
  'suspended',
  'terminated',
  'retired',
] as const;

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

/** Statuses that end an employment episode; a person may be re-hired after reaching one. */
export const TERMINAL_EMPLOYEE_STATUSES = ['terminated', 'retired'] as const;

export type TerminalEmployeeStatus = (typeof TERMINAL_EMPLOYEE_STATUSES)[number];

export const WORK_TYPES = [
  'full_time',
  'part_time',
  'contractor',
  'intern',
] as const;

export type WorkType = (typeof WORK_TYPES)[number];

export const RECORD_ORIGIN_TYPES = [
  'internal',
  'merger_acme',
  'referral',
] as const;

export type RecordOriginType = (typeof RECORD_ORIGIN_TYPES)[number];

export const EMPLOYEE_NO = {
  /** Assigned by DB default `employee_no_seq` (migrations 010–011); not accepted on create/update API. */
  MIN: 1,
} as const;

export const EMPLOYEE_NO_MESSAGES = {
  INVALID: 'Employee number must be a positive integer',
} as const;

export const EMPLOYEE_MESSAGES = {
  ID_NOT_FOUND: 'Employee with the specified ID does not exist',
  PERSON_ID_INVALID: 'Employee person_id must be a valid UUID',
  JOB_ID_INVALID: 'Employee job_id must be a valid UUID',
  OFFICE_ID_INVALID: 'Employee office_id must be a valid UUID',
  MANAGER_ID_INVALID: 'Employee manager_id must be a valid UUID',
  OWN_MANAGER: 'Employee cannot be their own manager',
  INVALID_STATUS: 'Employee status is invalid',
  INVALID_WORK_TYPE: 'Employee work type is invalid',
  INVALID_RECORD_ORIGIN: 'Employee record origin is invalid',
  INVALID_CONTRACT_DATES: 'Contract end date must be on or after contract start date',
  ACTIVE_EMPLOYMENT_EXISTS:
    'This person already has an active employment. End the current employment before creating a new hire.',
} as const;

/** API validation messages for employee date fields (Zod schemas). */
export const EMPLOYEE_DATE_MESSAGES = {
  CONTRACT_START_REQUIRED: 'Contract start date is required',
  CONTRACT_START_INVALID: 'Contract start date must be YYYY-MM-DD',
  CONTRACT_END_INVALID: 'Contract end date must be YYYY-MM-DD',
} as const;

/** API validation messages for employee-related UUID fields (Zod schemas). */
export const EMPLOYEE_ID_MESSAGES = {
  EMPLOYEE_ID_REQUIRED: 'id is required',
  EMPLOYEE_ID_INVALID: 'id must be a valid UUID',
  JOB_ID_REQUIRED: 'job_id is required',
  JOB_ID_INVALID: 'job_id must be a valid UUID',
  OFFICE_ID_REQUIRED: 'office_id is required',
  OFFICE_ID_INVALID: 'office_id must be a valid UUID',
  MANAGER_ID_INVALID: 'manager_id must be a valid UUID',
} as const;

export function isEmployeeStatus(value: string): value is EmployeeStatus {
  return (EMPLOYEE_STATUSES as readonly string[]).includes(value);
}

export function isTerminalEmployeeStatus(value: string): value is TerminalEmployeeStatus {
  return (TERMINAL_EMPLOYEE_STATUSES as readonly string[]).includes(value);
}

export function isWorkType(value: string): value is WorkType {
  return (WORK_TYPES as readonly string[]).includes(value);
}

export function isRecordOriginType(value: string): value is RecordOriginType {
  return (RECORD_ORIGIN_TYPES as readonly string[]).includes(value);
}
