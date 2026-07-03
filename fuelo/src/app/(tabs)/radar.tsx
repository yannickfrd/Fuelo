import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CanardChart } from '@/components/canard-chart';
import { Primary, Spacing } from '@/constants/theme';
import { useSessionContext } from '@/contexts/session-context';
import { useCanardStats, Period } from '@/hooks/use-canard-stats';
import { useTheme } from '@/hooks/use-theme';
import { INCIDENT_ICONS, INCIDENT_LABELS, INCIDENT_TYPES } from '@/types/incident';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'session', label: 'Trajets' },
  { key: 'day',     label: 'Jour' },
  { key: 'week',    label: 'Semaine' },
  { key: 'month',   label: 'Mois' },
  { key: 'year',    label: 'Année' },
];

export default function CanardsScreen() {
  const [period, setPeriod] = useState<Period>('day');
  const stats = useCanardStats(period);
  const { isActive, incidents } = useSessionContext();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Radar</ThemedText>
          {isActive && (
            <View style={[styles.badge, { backgroundColor: '#E53935' }]}>
              <ThemedText type="small" style={styles.badgeText}>
                Session · {incidents.length} 🦆
              </ThemedText>
            </View>
          )}
        </View>

        <View style={[styles.periodBar, { borderColor: theme.backgroundSelected }]}>
        </View>

        <View style={[styles.periodBar, { borderColor: theme.backgroundSelected }]}>
          {PERIODS.map(p => (
            <Pressable key={p.key} onPress={() => setPeriod(p.key)} style={styles.periodBtn}>
              <ThemedView
                type={period === p.key ? 'backgroundSelected' : 'background'}
                style={styles.periodBtnInner}>
                <ThemedText
                  type="small"
                  style={period === p.key ? { color: Primary } : undefined}
                  themeColor={period === p.key ? undefined : 'textSecondary'}>
                  {p.label}
                </ThemedText>
              </ThemedView>
            </Pressable>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedView type="backgroundElement" style={styles.totalCard}>
            <ThemedText type="subtitle" style={styles.totalNumber}>{stats.total}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">canards</ThemedText>
          </ThemedView>

          <CanardChart data={stats.chartData} />

          {Object.keys(stats.byType).length > 0 && (
            <View style={styles.typeSection}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
                PAR TYPE
              </ThemedText>
              {INCIDENT_TYPES.filter(t => stats.byType[t]).map(type => (
                <ThemedView key={type} type="backgroundElement" style={styles.typeRow}>
                  <ThemedText style={styles.typeIcon}>{INCIDENT_ICONS[type]}</ThemedText>
                  <ThemedText type="small" style={styles.typeLabel}>{INCIDENT_LABELS[type]}</ThemedText>
                  <ThemedText type="smallBold">{stats.byType[type]}</ThemedText>
                </ThemedView>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  badgeText: { color: '#fff' },
  periodBar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Spacing.two,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  periodBtn: { flex: 1 },
  periodBtnInner: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  content: { gap: Spacing.three },
  totalCard: {
    borderRadius: Spacing.two,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  totalNumber: { fontSize: 48 },
  typeSection: { gap: Spacing.two },
  sectionLabel: {
    marginLeft: Spacing.one,
    marginBottom: Spacing.one,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.two,
  },
  typeIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  typeLabel: { flex: 1 },
});
