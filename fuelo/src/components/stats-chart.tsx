import { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Primary, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { FillUp } from '@/types/vehicle';

type Period = 'plein' | 'mois' | 'annee';

const CHART_H = 180;
const PAD_TOP = 16;
const PAD_BOTTOM = 36;
const PAD_LEFT = 44;
const PAD_RIGHT = 12;

const MONTHS_SHORT = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];

interface DataPoint {
  label: string;
  value: number;
}

function shortDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${parseInt(d)} ${MONTHS_SHORT[parseInt(m) - 1]}`;
}

function computeSegments(fillups: FillUp[]) {
  const sorted = [...fillups].sort((a, b) => a.odometer - b.odometer);
  const segments: { date: string; liters: number; km: number }[] = [];
  let lastFull: FillUp | null = null;
  let acc = 0;

  for (const f of sorted) {
    acc += f.liters;
    if (f.isFullTank === 1) {
      if (lastFull !== null) {
        const km = f.odometer - lastFull.odometer;
        if (km > 0) segments.push({ date: f.date, liters: acc, km });
      }
      lastFull = f;
      acc = 0;
    }
  }
  return segments;
}

function computeData(fillups: FillUp[], period: Period): DataPoint[] {
  const segments = computeSegments(fillups);

  if (period === 'plein') {
    return segments.map(s => ({
      label: shortDate(s.date),
      value: (s.liters / s.km) * 100,
    }));
  }

  if (period === 'mois') {
    const map = new Map<string, { liters: number; km: number }>();
    for (const s of segments) {
      const key = s.date.slice(0, 7);
      const prev = map.get(key) ?? { liters: 0, km: 0 };
      map.set(key, { liters: prev.liters + s.liters, km: prev.km + s.km });
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, { liters, km }]) => {
        const [y, m] = key.split('-');
        return { label: `${MONTHS_SHORT[parseInt(m) - 1]} ${y.slice(2)}`, value: (liters / km) * 100 };
      });
  }

  const map = new Map<string, { liters: number; km: number }>();
  for (const s of segments) {
    const y = s.date.slice(0, 4);
    const prev = map.get(y) ?? { liters: 0, km: 0 };
    map.set(y, { liters: prev.liters + s.liters, km: prev.km + s.km });
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, { liters, km }]) => ({ label: year, value: (liters / km) * 100 }));
}

function Chart({ data, avg, width, theme }: { data: DataPoint[]; avg: number; width: number; theme: ReturnType<typeof useTheme> }) {
  const chartW = width - PAD_LEFT - PAD_RIGHT;
  const chartH = CHART_H - PAD_TOP - PAD_BOTTOM;

  const values = data.map(d => d.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padding = Math.max((rawMax - rawMin) * 0.2, 1);
  const minVal = Math.max(0, rawMin - padding);
  const maxVal = rawMax + padding;
  const range = maxVal - minVal || 1;

  function toX(i: number) {
    return PAD_LEFT + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2);
  }
  function toY(v: number) {
    return PAD_TOP + chartH - ((v - minVal) / range) * chartH;
  }

  const pathD = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)},${toY(d.value).toFixed(1)}`)
    .join(' ');

  const areaD = `${pathD} L ${toX(data.length - 1).toFixed(1)},${(PAD_TOP + chartH).toFixed(1)} L ${PAD_LEFT.toFixed(1)},${(PAD_TOP + chartH).toFixed(1)} Z`;

  const tickStep = range <= 4 ? 1 : range <= 8 ? 2 : range <= 20 ? 5 : 10;
  const tickStart = Math.ceil(minVal / tickStep) * tickStep;
  const ticks: number[] = [];
  for (let t = tickStart; t <= maxVal + 0.01; t += tickStep) {
    ticks.push(Math.round(t * 10) / 10);
  }

  const maxXLabels = 6;
  const step = data.length <= maxXLabels ? 1 : Math.ceil(data.length / maxXLabels);
  const xLabels = data
    .map((d, i) => ({ d, i }))
    .filter(({ i }) => i % step === 0 || i === data.length - 1);

  const avgY = toY(avg);

  return (
    <Svg width={width} height={CHART_H}>
      <Defs>
        <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={Primary} stopOpacity="0.25" />
          <Stop offset="1" stopColor={Primary} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Grid lines */}
      {ticks.map((t, i) => (
        <Line
          key={i}
          x1={PAD_LEFT} x2={width - PAD_RIGHT}
          y1={toY(t)} y2={toY(t)}
          stroke={theme.backgroundSelected}
          strokeWidth={1}
        />
      ))}

      {/* Average dashed line */}
      <Line
        x1={PAD_LEFT} x2={width - PAD_RIGHT}
        y1={avgY} y2={avgY}
        stroke={Primary}
        strokeWidth={1}
        strokeDasharray="4,4"
        opacity={0.6}
      />

      {/* Area fill */}
      <Path d={areaD} fill="url(#fill)" />

      {/* Line */}
      <Path d={pathD} stroke={Primary} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots */}
      {data.map((d, i) => (
        <Circle key={i} cx={toX(i)} cy={toY(d.value)} r={3.5} fill={Primary} />
      ))}

      {/* Y labels */}
      {ticks.map((t, i) => (
        <SvgText key={i} x={PAD_LEFT - 6} y={toY(t) + 4} fontSize={10} fill={theme.textSecondary} textAnchor="end">
          {t % 1 === 0 ? t.toFixed(0) : t.toFixed(1)}
        </SvgText>
      ))}

      {/* X labels */}
      {xLabels.map(({ d, i }) => (
        <SvgText key={i} x={toX(i)} y={CHART_H - 6} fontSize={10} fill={theme.textSecondary} textAnchor="middle">
          {d.label}
        </SvgText>
      ))}
    </Svg>
  );
}

const PERIODS: { key: Period; label: string }[] = [
  { key: 'plein', label: 'Plein' },
  { key: 'mois', label: 'Mois' },
  { key: 'annee', label: 'Année' },
];

export function StatsChart({ fillups }: { fillups: FillUp[] }) {
  const theme = useTheme();
  const [period, setPeriod] = useState<Period>('plein');
  const [width, setWidth] = useState(0);

  const data = computeData(fillups, period);
  const avg = data.length > 0 ? data.reduce((s, d) => s + d.value, 0) / data.length : 0;

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText type="smallBold">Consommation</ThemedText>
          {data.length > 0 && (
            <ThemedText type="small" themeColor="textSecondary">
              Moy. {avg.toFixed(1)} L/100 km
            </ThemedText>
          )}
        </View>
        <View style={styles.pills}>
          {PERIODS.map(p => (
            <Pressable
              key={p.key}
              onPress={() => setPeriod(p.key)}
              style={[
                styles.pill,
                { borderColor: theme.backgroundSelected },
                period === p.key && { backgroundColor: Primary, borderColor: Primary },
              ]}>
              <ThemedText
                type="small"
                style={period === p.key ? styles.pillActive : undefined}
                themeColor={period === p.key ? undefined : 'textSecondary'}>
                {p.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && data.length >= 2 ? (
          <Chart data={data} avg={avg} width={width} theme={theme} />
        ) : (
          <View style={styles.empty}>
            <ThemedText type="small" themeColor="textSecondary">
              {data.length === 0
                ? 'Aucune donnée'
                : 'Au moins 2 pleins complets consécutifs requis'}
            </ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  pills: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  pill: {
    borderWidth: 1,
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  pillActive: {
    color: '#fff',
  },
  empty: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
