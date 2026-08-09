import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const peopleTable = pgTable('people', {
  id: uuid('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phoneNumber: text('phone_number'),
  cityId: uuid('city_id'),
  createdAt: timestamp('created_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
