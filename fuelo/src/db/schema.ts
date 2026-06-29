import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const VEHICLE_TYPES = ['Voiture', 'Moto', 'Camionnette', 'Scooter', 'Camping-car'] as const;
export const ENGINE_TYPES = ['Essence', 'Éthanol', 'Diesel', 'Électrique', 'GPL'] as const;
export const FUEL_TYPES = ['SP95', 'SP98', 'E10', 'E85', 'Diesel', 'GPL'] as const;

export const vehicles = sqliteTable('vehicles', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  name:        text('name').notNull(),
  vehicleType: text('vehicleType', { enum: VEHICLE_TYPES }).notNull(),
  engineType:  text('engineType', { enum: ENGINE_TYPES }).notNull(),
  isFavorite:  integer('isFavorite').notNull().default(0),
});

export const fillups = sqliteTable('fillups', {
  id:            integer('id').primaryKey({ autoIncrement: true }),
  vehicleId:     integer('vehicleId').notNull(),
  date:          text('date').notNull(),
  odometer:      integer('odometer').notNull(),
  fuelType:      text('fuelType', { enum: FUEL_TYPES }).notNull(),
  liters:        real('liters').notNull(),
  pricePerLiter: real('pricePerLiter').notNull(),
  totalPrice:    real('totalPrice').notNull(),
  isFullTank:    integer('isFullTank').notNull().default(1),
});
