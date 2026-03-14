import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const departmentsTable = pgTable('departments', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  parentId: uuid('parent_id'),
  createdAt: timestamp('created_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});