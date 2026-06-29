import { asc, desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { vehicles } from '@/db/schema';
import { Vehicle } from '@/types/vehicle';

export function getVehicles(): Vehicle[] {
  return db
    .select()
    .from(vehicles)
    .orderBy(desc(vehicles.isFavorite), asc(vehicles.name))
    .all();
}

export function getVehicle(id: number): Vehicle | undefined {
  return db.select().from(vehicles).where(eq(vehicles.id, id)).get();
}

export function addVehicle(vehicle: Omit<Vehicle, 'id' | 'isFavorite'>): void {
  db.insert(vehicles).values({ ...vehicle, isFavorite: 0 }).run();
}

export function updateVehicle(vehicle: Vehicle): void {
  db.update(vehicles)
    .set({ name: vehicle.name, vehicleType: vehicle.vehicleType, engineType: vehicle.engineType })
    .where(eq(vehicles.id, vehicle.id))
    .run();
}

export function toggleFavorite(id: number, isFavorite: boolean): void {
  db.update(vehicles).set({ isFavorite: isFavorite ? 1 : 0 }).where(eq(vehicles.id, id)).run();
}

export function deleteVehicle(id: number): void {
  db.delete(vehicles).where(eq(vehicles.id, id)).run();
}
