import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const JobsTable = pgTable('jobs', {
  id: uuid('id').primaryKey(),
  title: text('title').notNull(),
  departmentId: uuid('department_id'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});