import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const citiesTable = pgTable('cities', {
  id: uuid('id').primaryKey(),
  countryId: uuid('country_id').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
});
