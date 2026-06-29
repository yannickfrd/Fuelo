import { InferSelectModel } from 'drizzle-orm';

import { ENGINE_TYPES, FUEL_TYPES, VEHICLE_TYPES, fillups, vehicles } from '@/db/schema';

export { ENGINE_TYPES, FUEL_TYPES, VEHICLE_TYPES };

export type VehicleType = (typeof VEHICLE_TYPES)[number];
export type EngineType = (typeof ENGINE_TYPES)[number];
export type FuelType = (typeof FUEL_TYPES)[number];

export const COMPATIBLE_FUELS: Record<EngineType, FuelType[]> = {
  Essence:     ['SP95', 'SP98', 'E10'],
  Éthanol:    ['SP95', 'SP98', 'E10', 'E85'],
  Diesel:      ['Diesel'],
  Électrique:  [],
  GPL:         ['GPL', 'SP95'],
};

export type Vehicle = InferSelectModel<typeof vehicles>;
export type FillUp = InferSelectModel<typeof fillups>;
