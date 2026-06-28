import { asc, desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { vehicles } from '@/db/schema';
import { Vehicle } from '@/types/vehicle';

export function initDatabase(): void {
  db.$client.execSync(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      vehicleType TEXT NOT NULL,
      engineType TEXT NOT NULL,
      isFavorite INTEGER NOT NULL DEFAULT 0
    );
  `);

  const columns = db.$client.getAllSync<{ name: string }>('PRAGMA table_info(vehicles)');

  const hasFuelType = columns.some(c => c.name === 'fuelType');
  const hasEngineType = columns.some(c => c.name === 'engineType');
  if (hasFuelType && !hasEngineType) {
    db.$client.runSync(`ALTER TABLE vehicles ADD COLUMN engineType TEXT NOT NULL DEFAULT 'Essence'`);
    db.$client.runSync(`UPDATE vehicles SET engineType = fuelType`);
  }

  const hasIsFavorite = columns.some(c => c.name === 'isFavorite');
  if (!hasIsFavorite) {
    db.$client.runSync(`ALTER TABLE vehicles ADD COLUMN isFavorite INTEGER NOT NULL DEFAULT 0`);
  }
}

export function getVehicles(): Vehicle[] {
  return db
    .select()
    .from(vehicles)
    .orderBy(desc(vehicles.isFavorite), asc(vehicles.name))
    .all();
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
  db.update(vehicles)
    .set({ isFavorite: isFavorite ? 1 : 0 })
    .where(eq(vehicles.id, id))
    .run();
}

export function deleteVehicle(id: number): void {
  db.delete(vehicles).where(eq(vehicles.id, id)).run();
}
