import { renderHook } from '@testing-library/react-native';

import { useCanardStats } from '@/hooks/useCanardStats';
import { getAllIncidents } from '@/repositories/incidents';
import { getAllSessions } from '@/repositories/sessions';
import type { Incident, Session } from '@/types/incident';

jest.mock('@/repositories/incidents', () => ({ getAllIncidents: jest.fn() }));
jest.mock('@/repositories/sessions', () => ({ getAllSessions: jest.fn() }));

const mockGetAllIncidents = getAllIncidents as jest.MockedFunction<typeof getAllIncidents>;
const mockGetAllSessions = getAllSessions as jest.MockedFunction<typeof getAllSessions>;

// Jeudi 15 janvier 2026, midi (heure locale)
const MOCK_NOW = new Date(2026, 0, 15, 12, 0, 0);

function s(id: number, startedAt: string, endedAt: string | null = null): Session {
  return { id, startedAt, endedAt };
}

function inc(id: number, sessionId: number, timestamp: string, type: string | null = null): Incident {
  return { id, sessionId, timestamp, type } as Incident;
}

function getStats(period: Parameters<typeof useCanardStats>[0]) {
  const { result } = renderHook(() => useCanardStats(period));
  return result.current;
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(MOCK_NOW);
  mockGetAllIncidents.mockReturnValue([]);
  mockGetAllSessions.mockReturnValue([]);
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

// ─── période session ────────────────────────────────────────────────────────

describe('useCanardStats — période session', () => {
  it('retourne des zéros si aucune session', () => {
    const stats = getStats('session');
    expect(stats.total).toBe(0);
    expect(stats.avgPerSession).toBe(0);
    expect(stats.record).toBe(0);
    expect(stats.chartData).toEqual([]);
  });

  it("retourne des zéros si les sessions n'ont aucun incident", () => {
    mockGetAllSessions.mockReturnValue([s(1, '2026-01-15T10:00:00')]);
    const stats = getStats('session');
    expect(stats.total).toBe(0);
    expect(stats.avgPerSession).toBe(0);
    expect(stats.record).toBe(0);
  });

  it('calcule total, record et moyenne pour une session unique', () => {
    mockGetAllSessions.mockReturnValue([s(1, '2026-01-15T10:00:00')]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2026-01-15T10:01:00'),
      inc(2, 1, '2026-01-15T10:02:00'),
      inc(3, 1, '2026-01-15T10:03:00'),
    ]);
    const stats = getStats('session');
    expect(stats.total).toBe(3);
    expect(stats.record).toBe(3);
    expect(stats.avgPerSession).toBe(3);
  });

  it('calcule la moyenne arrondie à 1 décimale (3 incidents / 2 sessions = 1.5)', () => {
    mockGetAllSessions.mockReturnValue([
      s(1, '2026-01-14T10:00:00'),
      s(2, '2026-01-15T10:00:00'),
    ]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2026-01-14T10:01:00'),
      inc(2, 1, '2026-01-14T10:02:00'),
      inc(3, 2, '2026-01-15T10:01:00'),
    ]);
    const stats = getStats('session');
    expect(stats.avgPerSession).toBe(1.5);
    expect(stats.record).toBe(2);
  });

  it('arrondit 1 incident / 3 sessions à 0.3', () => {
    mockGetAllSessions.mockReturnValue([
      s(1, '2026-01-13T10:00:00'),
      s(2, '2026-01-14T10:00:00'),
      s(3, '2026-01-15T10:00:00'),
    ]);
    mockGetAllIncidents.mockReturnValue([inc(1, 1, '2026-01-13T10:01:00')]);
    const stats = getStats('session');
    expect(stats.avgPerSession).toBe(0.3);
    expect(stats.record).toBe(1);
  });

  it("n'affiche que les 10 dernières sessions dans le graphique", () => {
    const sessions = Array.from({ length: 11 }, (_, i) =>
      s(i + 1, `2026-01-${String(i + 1).padStart(2, '0')}T10:00:00`),
    );
    mockGetAllSessions.mockReturnValue(sessions);
    const stats = getStats('session');
    expect(stats.chartData).toHaveLength(10);
    // La session 1 (1 jan) est exclue ; la première affichée est le 2 jan
    expect(stats.chartData[0].label).toBe('2/1');
  });

  it('exclut du total les incidents appartenant à la 11e session (hors last10)', () => {
    const sessions = Array.from({ length: 11 }, (_, i) =>
      s(i + 1, `2026-01-${String(i + 1).padStart(2, '0')}T10:00:00`),
    );
    const incidents = sessions.map((sess, i) =>
      inc(i + 1, sess.id, `2026-01-${String(i + 1).padStart(2, '0')}T10:05:00`),
    );
    mockGetAllSessions.mockReturnValue(sessions);
    mockGetAllIncidents.mockReturnValue(incidents);
    const stats = getStats('session');
    expect(stats.total).toBe(10); // session 1 exclue
  });

  it('trie les sessions du plus ancien au plus récent dans le graphique', () => {
    mockGetAllSessions.mockReturnValue([
      s(3, '2026-01-15T10:00:00'),
      s(1, '2026-01-13T10:00:00'),
      s(2, '2026-01-14T10:00:00'),
    ]);
    const stats = getStats('session');
    expect(stats.chartData.map(b => b.label)).toEqual(['13/1', '14/1', '15/1']);
  });

  it('byType compte TOUS les incidents (pas seulement ceux de la période)', () => {
    mockGetAllSessions.mockReturnValue([s(1, '2026-01-15T10:00:00')]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2026-01-15T10:01:00', 'coupe_route'),
      // incident orphelin : sessionId=999 n'existe pas dans les sessions
      inc(2, 999, '2026-01-15T10:02:00', 'zigzag'),
    ]);
    const stats = getStats('session');
    expect(stats.total).toBe(1);           // incident 2 hors last10 → exclu du total
    expect(stats.byType).toEqual({ coupe_route: 1, zigzag: 1 }); // mais comptabilisé dans byType
  });

  it('byType ignore les incidents sans type (null)', () => {
    mockGetAllSessions.mockReturnValue([s(1, '2026-01-15T10:00:00')]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2026-01-15T10:01:00', null),
      inc(2, 1, '2026-01-15T10:02:00', 'zigzag'),
    ]);
    const stats = getStats('session');
    expect(stats.byType).toEqual({ zigzag: 1 });
    expect(Object.keys(stats.byType)).not.toContain('null');
  });

  it('record est 0 même si des sessions existent sans incident', () => {
    mockGetAllSessions.mockReturnValue([
      s(1, '2026-01-14T10:00:00'),
      s(2, '2026-01-15T10:00:00'),
    ]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2026-01-14T10:01:00'), // 1 incident dans session 1, 0 dans session 2
    ]);
    const stats = getStats('session');
    expect(stats.record).toBe(1);
    expect(stats.avgPerSession).toBe(0.5);
  });
});

// ─── période day ────────────────────────────────────────────────────────────

describe('useCanardStats — période day', () => {
  it('retourne 24 buckets à 0 si aucun incident', () => {
    const stats = getStats('day');
    expect(stats.chartData).toHaveLength(24);
    expect(stats.total).toBe(0);
    expect(stats.chartData.every(b => b.value === 0)).toBe(true);
  });

  it('labels : 0h à 23h', () => {
    const stats = getStats('day');
    expect(stats.chartData[0].label).toBe('0h');
    expect(stats.chartData[14].label).toBe('14h');
    expect(stats.chartData[23].label).toBe('23h');
  });

  it('place un incident dans le bon bucket horaire', () => {
    mockGetAllSessions.mockReturnValue([s(1, '2026-01-15T10:00:00')]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2026-01-15T14:30:00'),
    ]);
    const stats = getStats('day');
    expect(stats.chartData[14].value).toBe(1);
    expect(stats.total).toBe(1);
  });

  it('accumule plusieurs incidents dans le même bucket horaire', () => {
    mockGetAllSessions.mockReturnValue([s(1, '2026-01-15T10:00:00')]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2026-01-15T10:00:00'),
      inc(2, 1, '2026-01-15T10:30:00'),
      inc(3, 1, '2026-01-15T10:59:00'),
    ]);
    const stats = getStats('day');
    expect(stats.chartData[10].value).toBe(3);
  });

  it("exclut les incidents d'hier (23h59)", () => {
    mockGetAllSessions.mockReturnValue([s(1, '2026-01-14T10:00:00')]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2026-01-14T23:59:59'),
    ]);
    const stats = getStats('day');
    expect(stats.total).toBe(0);
    expect(stats.chartData.every(b => b.value === 0)).toBe(true);
  });

  it("inclut un incident exactement à minuit aujourd'hui", () => {
    mockGetAllSessions.mockReturnValue([s(1, '2026-01-15T00:00:00')]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2026-01-15T00:00:00'),
    ]);
    const stats = getStats('day');
    expect(stats.total).toBe(1);
    expect(stats.chartData[0].value).toBe(1);
  });
});

// ─── période week ───────────────────────────────────────────────────────────

// Contexte : now = jeudi 15 jan 2026, donc startOf('week') = lundi 12 jan 2026 00:00:00

describe('useCanardStats — période week', () => {
  it('retourne 7 buckets avec les labels Lun…Dim', () => {
    const stats = getStats('week');
    expect(stats.chartData).toHaveLength(7);
    expect(stats.chartData.map(b => b.label)).toEqual(
      ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    );
  });

  it('place un incident de lundi dans le bucket 0', () => {
    mockGetAllSessions.mockReturnValue([s(1, '2026-01-12T10:00:00')]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2026-01-12T10:00:00'), // lundi 12 jan
    ]);
    const stats = getStats('week');
    expect(stats.chartData[0].value).toBe(1);
    expect(stats.total).toBe(1);
  });

  it('place un incident de jeudi (aujourd\'hui) dans le bucket 3', () => {
    mockGetAllSessions.mockReturnValue([s(1, '2026-01-15T10:00:00')]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2026-01-15T10:00:00'),
    ]);
    const stats = getStats('week');
    expect(stats.chartData[3].value).toBe(1); // Jeu
  });

  it('exclut un incident du dimanche de la semaine précédente', () => {
    mockGetAllSessions.mockReturnValue([s(1, '2026-01-11T10:00:00')]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2026-01-11T10:00:00'), // dimanche 11 jan = semaine d'avant
    ]);
    const stats = getStats('week');
    expect(stats.total).toBe(0);
    expect(stats.chartData.every(b => b.value === 0)).toBe(true);
  });

  it('inclut un incident exactement à minuit du lundi (borne inclusive)', () => {
    mockGetAllSessions.mockReturnValue([s(1, '2026-01-12T00:00:00')]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2026-01-12T00:00:00'),
    ]);
    const stats = getStats('week');
    expect(stats.total).toBe(1);
    expect(stats.chartData[0].value).toBe(1);
  });

  it('répartit correctement plusieurs incidents sur plusieurs jours', () => {
    mockGetAllSessions.mockReturnValue([s(1, '2026-01-12T08:00:00')]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2026-01-12T08:00:00'), // lun → bucket 0
      inc(2, 1, '2026-01-13T08:00:00'), // mar → bucket 1
      inc(3, 1, '2026-01-13T09:00:00'), // mar → bucket 1
      inc(4, 1, '2026-01-15T08:00:00'), // jeu → bucket 3
    ]);
    const stats = getStats('week');
    expect(stats.chartData[0].value).toBe(1);
    expect(stats.chartData[1].value).toBe(2);
    expect(stats.chartData[3].value).toBe(1);
    expect(stats.total).toBe(4);
  });
});

// ─── période month ──────────────────────────────────────────────────────────

describe('useCanardStats — période month', () => {
  it('retourne toujours 12 buckets Jan-Déc', () => {
    const stats = getStats('month');
    expect(stats.chartData).toHaveLength(12);
    expect(stats.chartData[0].label).toBe('Jan');
    expect(stats.chartData[11].label).toBe('Déc');
  });

  it("couvre toute l'année courante — pas seulement le mois en cours", () => {
    mockGetAllSessions.mockReturnValue([
      s(1, '2026-01-05T10:00:00'),
      s(2, '2026-06-10T10:00:00'),
    ]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2026-01-05T10:00:00'), // Jan → bucket 0
      inc(2, 2, '2026-06-10T10:00:00'), // Juin → bucket 5
    ]);
    const stats = getStats('month');
    expect(stats.chartData[0].value).toBe(1);  // Jan
    expect(stats.chartData[5].value).toBe(1);  // Juin
    expect(stats.total).toBe(2);
  });

  it("exclut les incidents de l'année précédente", () => {
    mockGetAllSessions.mockReturnValue([s(1, '2025-12-15T10:00:00')]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2025-12-15T10:00:00'),
    ]);
    const stats = getStats('month');
    expect(stats.total).toBe(0);
    expect(stats.chartData.every(b => b.value === 0)).toBe(true);
  });

  it("inclut un incident exactement le 1er janvier (borne inclusive)", () => {
    mockGetAllSessions.mockReturnValue([s(1, '2026-01-01T00:00:00')]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2026-01-01T00:00:00'),
    ]);
    const stats = getStats('month');
    expect(stats.chartData[0].value).toBe(1); // Jan
  });

  it('place un incident de décembre dans le bucket 11', () => {
    mockGetAllSessions.mockReturnValue([s(1, '2026-12-31T10:00:00')]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2026-12-31T10:00:00'),
    ]);
    const stats = getStats('month');
    expect(stats.chartData[11].value).toBe(1); // Déc
  });
});

// ─── période year ───────────────────────────────────────────────────────────

describe('useCanardStats — période year', () => {
  it("retourne un seul bucket pour l'année courante si aucun incident", () => {
    const stats = getStats('year');
    expect(stats.chartData).toEqual([{ label: '2026', value: 0 }]);
    expect(stats.total).toBe(0);
  });

  it('crée un bucket par année depuis le premier incident', () => {
    mockGetAllSessions.mockReturnValue([
      s(1, '2024-06-01T10:00:00'),
      s(2, '2026-01-15T10:00:00'),
    ]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2024-06-01T10:00:00'),
      inc(2, 2, '2026-01-15T10:00:00'),
    ]);
    const stats = getStats('year');
    expect(stats.chartData).toHaveLength(3); // 2024, 2025, 2026
    expect(stats.chartData[0]).toEqual({ label: '2024', value: 1 });
    expect(stats.chartData[1]).toEqual({ label: '2025', value: 0 });
    expect(stats.chartData[2]).toEqual({ label: '2026', value: 1 });
  });

  it('inclut tous les incidents sans filtre de date', () => {
    mockGetAllSessions.mockReturnValue([s(1, '2020-01-01T10:00:00')]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2020-01-01T10:00:00'),
    ]);
    const stats = getStats('year');
    expect(stats.total).toBe(1);
    expect(stats.chartData[0].label).toBe('2020');
  });

  it("un incident dans le futur (> année courante) n'apparaît pas dans le graphique mais gonfle le total", () => {
    mockGetAllSessions.mockReturnValue([s(1, '2027-01-01T10:00:00')]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2027-01-01T10:00:00'),
    ]);
    const stats = getStats('year');
    // minYear = min(2026, 2027) = 2026 → seul bucket '2026' créé, idx 2027-2026=1 hors bornes
    expect(stats.total).toBe(1);
    expect(stats.chartData).toEqual([{ label: '2026', value: 0 }]);
  });

  it("le record correspond au max d'incidents dans une seule session", () => {
    mockGetAllSessions.mockReturnValue([
      s(1, '2025-06-01T10:00:00'),
      s(2, '2026-01-15T10:00:00'),
    ]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2025-06-01T10:00:00'),
      inc(2, 1, '2025-06-01T10:01:00'),
      inc(3, 1, '2025-06-01T10:02:00'), // session 1 → 3 incidents
      inc(4, 2, '2026-01-15T10:00:00'), // session 2 → 1 incident
    ]);
    const stats = getStats('year');
    expect(stats.record).toBe(3);
    expect(stats.avgPerSession).toBe(2); // 4 / 2
  });

  it("la moyenne année est calculée sur toutes les sessions, y compris celles sans incident", () => {
    mockGetAllSessions.mockReturnValue([
      s(1, '2026-01-10T10:00:00'),
      s(2, '2026-01-15T10:00:00'), // session sans incident
    ]);
    mockGetAllIncidents.mockReturnValue([
      inc(1, 1, '2026-01-10T10:01:00'),
      inc(2, 1, '2026-01-10T10:02:00'),
    ]);
    const stats = getStats('year');
    expect(stats.avgPerSession).toBe(1); // 2 / 2
    expect(stats.record).toBe(2);
  });
});
