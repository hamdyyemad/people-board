import { z } from 'zod';
import {
  EMPLOYEE_STATUSES,
  WORK_TYPES,
  RECORD_ORIGIN_TYPES,
  EMPLOYEE_ID_MESSAGES,
  EMPLOYEE_DATE_MESSAGES,
} from '../domain/constants/employee';
import {
  PERSON_NAME,
  PERSON_FIRST_NAME_MESSAGES,
  PERSON_LAST_NAME_MESSAGES,
  PERSON_EMAIL,
  PERSON_EMAIL_MESSAGES,
  PERSON_PHONE,
  PERSON_PHONE_MESSAGES,
  PERSON_ID_MESSAGES,
  PERSON_MESSAGES,
} from '../domain/constants/person';
import { basePaginationQuerySchema } from '@/backend_lib/shared/validation';

function requiredUuid(requiredMessage: string, invalidMessage: string) {
  return z.string({ message: requiredMessage }).uuid(invalidMessage);
}

function optionalUuid(invalidMessage: string) {
  return z
    .union([
      z.string().uuid(invalidMessage),
      z.literal('').transform(() => null),
      z.null(),
    ])
    .optional();
}

const dateStringSchema = z
  .string({ message: EMPLOYEE_DATE_MESSAGES.CONTRACT_START_REQUIRED })
  .regex(/^\d{4}-\d{2}-\d{2}$/, EMPLOYEE_DATE_MESSAGES.CONTRACT_START_INVALID);

const optionalDateSchema = z
  .union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, EMPLOYEE_DATE_MESSAGES.CONTRACT_END_INVALID),
    z.literal('').transform(() => null),
    z.null(),
  ])
  .optional();

const firstNameSchema = z
  .string({ message: PERSON_FIRST_NAME_MESSAGES.EMPTY })
  .trim()
  .min(PERSON_NAME.MIN_LENGTH, PERSON_FIRST_NAME_MESSAGES.EMPTY)
  .max(PERSON_NAME.MAX_LENGTH, PERSON_FIRST_NAME_MESSAGES.TOO_LONG);

const lastNameSchema = z
  .string({ message: PERSON_LAST_NAME_MESSAGES.EMPTY })
  .trim()
  .min(PERSON_NAME.MIN_LENGTH, PERSON_LAST_NAME_MESSAGES.EMPTY)
  .max(PERSON_NAME.MAX_LENGTH, PERSON_LAST_NAME_MESSAGES.TOO_LONG);

const optionalEmailSchema = z
  .union([
    z
      .string()
      .trim()
      .min(1, PERSON_EMAIL_MESSAGES.INVALID)
      .max(PERSON_EMAIL.MAX_LENGTH, PERSON_EMAIL_MESSAGES.TOO_LONG)
      .email(PERSON_EMAIL_MESSAGES.INVALID),
    z.literal('').transform(() => null),
    z.null(),
  ])
  .optional();

const phoneSchema = z
  .union([
    z
      .string()
      .trim()
      .min(PERSON_PHONE.MIN_LENGTH, PERSON_PHONE_MESSAGES.TOO_SHORT)
      .max(PERSON_PHONE.MAX_LENGTH, PERSON_PHONE_MESSAGES.TOO_LONG),
    z.literal('').transform(() => null),
    z.null(),
  ])
  .optional();

const employeeStatusSchema = z.enum(EMPLOYEE_STATUSES);
const workTypeSchema = z.enum(WORK_TYPES);
const recordOriginSchema = z.enum(RECORD_ORIGIN_TYPES);

const ALLOWED_EMPLOYEE_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'employeeNo',
  'status',
  'type',
  'contractStart',
  'firstName',
  'lastName',
  'email',
  'jobTitle',
  'officeName',
] as const;

export const employeeQuerySchema = basePaginationQuerySchema.extend({
  id: optionalUuid(EMPLOYEE_ID_MESSAGES.EMPLOYEE_ID_INVALID),
  jobId: optionalUuid(EMPLOYEE_ID_MESSAGES.JOB_ID_INVALID),
  officeId: optionalUuid(EMPLOYEE_ID_MESSAGES.OFFICE_ID_INVALID),
  status: employeeStatusSchema.optional(),
  type: workTypeSchema.optional(),
  employeeNo: z.coerce.number().int().positive().optional(),
  email: z.string().trim().optional(),
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  sortBy: z.string().default('createdAt').transform(v =>
    v.split(',').map(s => s.trim())
  ).refine(
    arr => arr.every(f => (ALLOWED_EMPLOYEE_SORT_FIELDS as readonly string[]).includes(f)),
    { message: `sortBy must be one of: ${ALLOWED_EMPLOYEE_SORT_FIELDS.join(', ')}` }
  ),
});

export type EmployeeQuery = z.output<typeof employeeQuerySchema>;

export const createEmployeeBodySchema = z
  .object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    email: optionalEmailSchema,
    phoneNumber: phoneSchema,
    cityId: requiredUuid(PERSON_ID_MESSAGES.CITY_ID_REQUIRED, PERSON_ID_MESSAGES.CITY_ID_INVALID),
    jobId: requiredUuid(EMPLOYEE_ID_MESSAGES.JOB_ID_REQUIRED, EMPLOYEE_ID_MESSAGES.JOB_ID_INVALID),
    officeId: requiredUuid(
      EMPLOYEE_ID_MESSAGES.OFFICE_ID_REQUIRED,
      EMPLOYEE_ID_MESSAGES.OFFICE_ID_INVALID
    ),
    managerId: optionalUuid(EMPLOYEE_ID_MESSAGES.MANAGER_ID_INVALID),
    status: employeeStatusSchema.default('onboarding'),
    type: workTypeSchema.default('full_time'),
    recordOrigin: recordOriginSchema.default('internal'),
    contractStart: dateStringSchema,
    contractEnd: optionalDateSchema,
  })
  .refine((data) => Boolean(data.email || data.phoneNumber), {
    message: PERSON_MESSAGES.CONTACT_REQUIRED,
    path: ['email'],
  })
  .refine(
    (data) => {
      if (!data.contractEnd) return true;
      return data.contractEnd >= data.contractStart;
    },
    {
      message: 'Contract end date must be on or after contract start date',
      path: ['contractEnd'],
    }
  );

export type CreateEmployeeBody = z.infer<typeof createEmployeeBodySchema>;

export const updateEmployeeBodySchema = z
  .object({
    firstName: firstNameSchema.optional(),
    lastName: lastNameSchema.optional(),
    email: optionalEmailSchema,
    phoneNumber: phoneSchema,
  cityId: optionalUuid(PERSON_ID_MESSAGES.CITY_ID_INVALID),
  jobId: z
    .union([
      z.string().uuid(EMPLOYEE_ID_MESSAGES.JOB_ID_INVALID),
      z.literal('').transform(() => undefined),
      z.undefined(),
    ])
    .optional(),
  officeId: z
    .union([
      z.string().uuid(EMPLOYEE_ID_MESSAGES.OFFICE_ID_INVALID),
      z.literal('').transform(() => undefined),
      z.undefined(),
    ])
    .optional(),
  managerId: optionalUuid(EMPLOYEE_ID_MESSAGES.MANAGER_ID_INVALID),
  status: employeeStatusSchema.optional(),
  type: workTypeSchema.optional(),
  recordOrigin: recordOriginSchema.optional(),
  contractStart: dateStringSchema.optional(),
  contractEnd: optionalDateSchema,
});

export type UpdateEmployeeBody = z.infer<typeof updateEmployeeBodySchema>;

export const employeeIdParamSchema = z.object({
  id: requiredUuid(EMPLOYEE_ID_MESSAGES.EMPLOYEE_ID_REQUIRED, EMPLOYEE_ID_MESSAGES.EMPLOYEE_ID_INVALID),
});

export type EmployeeIdParam = z.infer<typeof employeeIdParamSchema>;
