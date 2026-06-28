import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const VEHICLE_TYPES = ['Voiture', 'Moto', 'Camionnette', 'Scooter', 'Camping-car'] as const;
export const ENGINE_TYPES = ['Essence', 'Éthanol', 'Diesel', 'Électrique', 'GPL'] as const;

export const vehicles = sqliteTable('vehicles', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  name:        text('name').notNull(),
  vehicleType: text('vehicleType', { enum: VEHICLE_TYPES }).notNull(),
  engineType:  text('engineType', { enum: ENGINE_TYPES }).notNull(),
  isFavorite:  integer('isFavorite').notNull().default(0),
});
