import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { incidents } from '@/db/schema';
import { Incident, IncidentType } from '@/types/incident';

export function createIncident(sessionId: number, timestamp: string, type?: IncidentType): Incident {
  return db.insert(incidents).values({ sessionId, timestamp, type }).returning().get();
}

export function updateIncidentType(id: number, type: IncidentType): void {
  db.update(incidents).set({ type }).where(eq(incidents.id, id)).run();
}

export function getIncidentsBySession(sessionId: number): Incident[] {
  return db.select().from(incidents).where(eq(incidents.sessionId, sessionId)).all();
}

export function getAllIncidents(): Incident[] {
  return db.select().from(incidents).all();
}

export function deleteIncident(id: number): void {
  db.delete(incidents).where(eq(incidents.id, id)).run();
}
