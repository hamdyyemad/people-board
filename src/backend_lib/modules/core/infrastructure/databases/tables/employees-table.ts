import { pgTable, uuid, text, timestamp, date, integer } from 'drizzle-orm/pg-core';

export const employeesTable = pgTable('employees', {
  id: uuid('id').primaryKey(),
  personId: uuid('person_id').notNull(),
  employeeNo: integer('employee_no'),
  jobId: uuid('job_id').notNull(),
  officeId: uuid('office_id').notNull(),
  managerId: uuid('manager_id'),
  status: text('status').notNull().default('onboarding'),
  type: text('type').notNull().default('full_time'),
  recordOrigin: text('record_origin').notNull().default('internal'),
  contractStart: date('contract_start').notNull(),
  contractEnd: date('contract_end'),
  createdAt: timestamp('created_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
