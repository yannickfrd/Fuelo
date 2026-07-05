import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { settings } from '@/db/schema';

export function getSetting(key: string): string | null {
  return db.select().from(settings).where(eq(settings.key, key)).get()?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  db.insert(settings).values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } })
    .run();
}
