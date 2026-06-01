import { pgTable, uuid, text, timestamp, boolean, numeric } from 'drizzle-orm/pg-core';

export const officesTable = pgTable('offices', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  cityId: uuid('city_id').notNull(),
  isActive: boolean('is_active').default(true),
  address: text('address'),
  latitude: numeric('latitude', { precision: 10, scale: 8 }),
  longitude: numeric('longitude', { precision: 11, scale: 8 }),
  createdAt: timestamp('created_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
