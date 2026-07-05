import { InferSelectModel } from 'drizzle-orm';

import { INCIDENT_TYPES, incidents, sessions } from '@/db/schema';

export { INCIDENT_TYPES };

export type IncidentType = (typeof INCIDENT_TYPES)[number];
export type Incident = InferSelectModel<typeof incidents>;
export type Session = InferSelectModel<typeof sessions>;

export const INCIDENT_LABELS: Record<IncidentType, string> = {
  coupe_route:    'Coupe la route',
  lenteur:        'Roule trop lentement',
  telephone:      'Téléphone au volant',
  zigzag:         'Zigzag',
  feu_rouge:      'Grille un feu / stop',
  stationnement:  'Se gare n\'importe où',
  eblouissement:  'Éblouissement',
};

export const INCIDENT_ICONS: Record<IncidentType, string> = {
  coupe_route:    '🚗',
  lenteur:        '🐌',
  telephone:      '📱',
  zigzag:         '↔️',
  feu_rouge:      '🚦',
  stationnement:  '🅿️',
  eblouissement:  '🔆',
};
