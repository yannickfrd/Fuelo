import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

const expo = openDatabaseSync('fuelo.db');
export const db = drizzle(expo, { schema });

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

  const vehicleColumns = db.$client.getAllSync<{ name: string }>('PRAGMA table_info(vehicles)');

  const hasFuelType = vehicleColumns.some(c => c.name === 'fuelType');
  const hasEngineType = vehicleColumns.some(c => c.name === 'engineType');
  if (hasFuelType && !hasEngineType) {
    db.$client.runSync(`ALTER TABLE vehicles ADD COLUMN engineType TEXT NOT NULL DEFAULT 'Essence'`);
    db.$client.runSync(`UPDATE vehicles SET engineType = fuelType`);
  }

  const hasIsFavorite = vehicleColumns.some(c => c.name === 'isFavorite');
  if (!hasIsFavorite) {
    db.$client.runSync(`ALTER TABLE vehicles ADD COLUMN isFavorite INTEGER NOT NULL DEFAULT 0`);
  }

  db.$client.execSync(`
    CREATE TABLE IF NOT EXISTS fillups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicleId INTEGER NOT NULL,
      date TEXT NOT NULL,
      odometer INTEGER NOT NULL,
      fuelType TEXT NOT NULL,
      liters REAL NOT NULL,
      pricePerLiter REAL NOT NULL,
      totalPrice REAL NOT NULL,
      isFullTank INTEGER NOT NULL DEFAULT 1
    );
  `);

  db.$client.execSync(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      startedAt TEXT NOT NULL,
      endedAt TEXT
    );
  `);

  db.$client.execSync(`
    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      type TEXT
    );
  `);
}
