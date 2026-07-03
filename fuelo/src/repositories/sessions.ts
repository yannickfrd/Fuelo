import { eq, isNull } from 'drizzle-orm';

import { db } from '@/db/client';
import { sessions } from '@/db/schema';
import { Session } from '@/types/incident';

export function createSession(startedAt: string): Session {
  const result = db.insert(sessions).values({ startedAt }).returning().get();
  return result;
}

export function endSession(id: number, endedAt: string): void {
  db.update(sessions).set({ endedAt }).where(eq(sessions.id, id)).run();
}

export function getActiveSession(): Session | undefined {
  return db.select().from(sessions).where(isNull(sessions.endedAt)).get();
}

export function getAllSessions(): Session[] {
  return db.select().from(sessions).all();
}
