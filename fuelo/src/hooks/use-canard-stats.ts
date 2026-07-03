import { useMemo } from 'react';

import { getAllIncidents } from '@/repositories/incidents';
import { getAllSessions } from '@/repositories/sessions';
import { Incident, INCIDENT_TYPES, IncidentType, Session } from '@/types/incident';

export type Period = 'session' | 'day' | 'week' | 'month' | 'year';

export type ChartBar = { label: string; value: number };

export type CanardStats = {
  total: number;
  chartData: ChartBar[];
  byType: Partial<Record<IncidentType, number>>;
  avgPerSession: number;
  record: number;
};

function isoToDate(iso: string) {
  return new Date(iso);
}

function startOf(period: Exclude<Period, 'session'>): Date {
  const now = new Date();
  if (period === 'day') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === 'month') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return new Date(now.getFullYear(), 0, 1);
}

function sessionStats(
  incidents: Incident[],
  sessions: Session[],
): { avgPerSession: number; record: number } {
  if (sessions.length === 0) return { avgPerSession: 0, record: 0 };
  const countMap = new Map<number, number>();
  for (const inc of incidents) {
    countMap.set(inc.sessionId, (countMap.get(inc.sessionId) ?? 0) + 1);
  }
  let record = 0;
  for (const s of sessions) {
    record = Math.max(record, countMap.get(s.id) ?? 0);
  }
  const avg = Math.round((incidents.length / sessions.length) * 10) / 10;
  return { avgPerSession: avg, record };
}

function byTypeCount(list: Incident[]): Partial<Record<IncidentType, number>> {
  const counts: Partial<Record<IncidentType, number>> = {};
  for (const inc of list) {
    if (inc.type) {
      counts[inc.type as IncidentType] = (counts[inc.type as IncidentType] ?? 0) + 1;
    }
  }
  return counts;
}

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export function useCanardStats(period: Period, incidentVersion?: number): CanardStats {
  return useMemo(() => {
    const allIncidents = getAllIncidents();
    const allSessions = getAllSessions();

    if (period === 'session') {
      const sessionMap = new Map<number, number>();
      for (const inc of allIncidents) {
        sessionMap.set(inc.sessionId, (sessionMap.get(inc.sessionId) ?? 0) + 1);
      }
      const last10 = [...allSessions]
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
        .slice(0, 10)
        .reverse();

      const chartData: ChartBar[] = last10.map((s: Session) => {
        const d = isoToDate(s.startedAt);
        return {
          label: `${d.getDate()}/${d.getMonth() + 1}`,
          value: sessionMap.get(s.id) ?? 0,
        };
      });

      const periodInc = allIncidents.filter(i =>
        last10.some((s: Session) => s.id === i.sessionId),
      );
      return {
        total: periodInc.length,
        chartData,
        byType: byTypeCount(allIncidents),
        ...sessionStats(periodInc, last10),
      };
    }

    const from = startOf(period);
    const filtered = allIncidents.filter(i => isoToDate(i.timestamp) >= from);
    const filteredSessions = allSessions.filter(s => isoToDate(s.startedAt) >= from);

    if (period === 'day') {
      const buckets = Array.from({ length: 24 }, (_, h) => ({ label: `${h}h`, value: 0 }));
      for (const inc of filtered) {
        buckets[isoToDate(inc.timestamp).getHours()].value += 1;
      }
      return {
        total: filtered.length,
        chartData: buckets,
        byType: byTypeCount(filtered),
        ...sessionStats(filtered, filteredSessions),
      };
    }

    if (period === 'week') {
      const buckets = DAY_LABELS.map(label => ({ label, value: 0 }));
      for (const inc of filtered) {
        const dow = (isoToDate(inc.timestamp).getDay() + 6) % 7;
        buckets[dow].value += 1;
      }
      return {
        total: filtered.length,
        chartData: buckets,
        byType: byTypeCount(filtered),
        ...sessionStats(filtered, filteredSessions),
      };
    }

    if (period === 'month') {
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearInc = allIncidents.filter(i => isoToDate(i.timestamp) >= yearStart);
      const yearSessions = allSessions.filter(s => isoToDate(s.startedAt) >= yearStart);
      const buckets = MONTH_LABELS.map(label => ({ label, value: 0 }));
      for (const inc of yearInc) {
        buckets[isoToDate(inc.timestamp).getMonth()].value += 1;
      }
      return {
        total: yearInc.length,
        chartData: buckets,
        byType: byTypeCount(yearInc),
        ...sessionStats(yearInc, yearSessions),
      };
    }

    // year — all data
    const now = new Date();
    const currentYear = now.getFullYear();
    if (allIncidents.length === 0) {
      return { total: 0, chartData: [{ label: String(currentYear), value: 0 }], byType: {}, avgPerSession: 0, record: 0 };
    }
    const minYear = allIncidents.reduce(
      (min, i) => Math.min(min, isoToDate(i.timestamp).getFullYear()),
      currentYear,
    );
    const yearBuckets: ChartBar[] = [];
    for (let y = minYear; y <= currentYear; y++) {
      yearBuckets.push({ label: String(y), value: 0 });
    }
    for (const inc of allIncidents) {
      const idx = isoToDate(inc.timestamp).getFullYear() - minYear;
      if (idx >= 0 && idx < yearBuckets.length) yearBuckets[idx].value += 1;
    }
    return {
      total: allIncidents.length,
      chartData: yearBuckets,
      byType: byTypeCount(allIncidents),
      ...sessionStats(allIncidents, allSessions),
    };
  }, [period, incidentVersion]);
}
