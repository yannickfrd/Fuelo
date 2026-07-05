import { desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { fillups } from '@/db/schema';
import { FillUp } from '@/types/vehicle';

export function getFillups(vehicleId: number): FillUp[] {
  return db
    .select()
    .from(fillups)
    .where(eq(fillups.vehicleId, vehicleId))
    .orderBy(desc(fillups.date), desc(fillups.odometer))
    .all();
}

export function addFillup(fillup: Omit<FillUp, 'id'>): void {
  db.insert(fillups).values(fillup).run();
}

export function updateFillup(fillup: FillUp): void {
  db.update(fillups)
    .set({
      date:          fillup.date,
      odometer:      fillup.odometer,
      fuelType:      fillup.fuelType,
      liters:        fillup.liters,
      pricePerLiter: fillup.pricePerLiter,
      totalPrice:    fillup.totalPrice,
      isFullTank:    fillup.isFullTank,
    })
    .where(eq(fillups.id, fillup.id))
    .run();
}

export function deleteFillup(id: number): void {
  db.delete(fillups).where(eq(fillups.id, id)).run();
}
