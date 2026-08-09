import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const employeeStatusHistoryTable = pgTable('employee_status_history', {
  id: uuid('id').primaryKey(),
  employeeId: uuid('employee_id').notNull(),
  oldStatus: text('old_status'),
  newStatus: text('new_status').notNull(),
  changedBy: uuid('changed_by'),
  manualNote: text('manual_note'),
  systemNote: text('system_note'),
  createdAt: timestamp('created_at', { withTimezone: true }),
});
