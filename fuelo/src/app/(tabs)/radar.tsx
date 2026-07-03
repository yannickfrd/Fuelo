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

function HelpBubble({ text, align = 'right' }: { text: string; align?: 'left' | 'right' }) {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();
  return (
    <View>
      <Pressable
        onPress={() => setVisible(v => !v)}
        hitSlop={10}
        style={[styles.helpBtn, { borderColor: theme.backgroundSelected }]}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.helpBtnText}>?</ThemedText>
      </Pressable>
      {visible && (
        <ThemedView
          type="backgroundSelected"
          style={[styles.tooltip, align === 'left' ? { left: 0 } : { right: 0 }]}>
          <ThemedText type="small" themeColor="textSecondary">{text}</ThemedText>
        </ThemedView>
      )}
    </View>
  );
}

export default function CanardsScreen() {
  const [period, setPeriod] = useState<Period>('day');
  const { isActive, incidentCount } = useSessionContext();
  const stats = useCanardStats(period, incidentCount);
  const theme = useTheme();

  const periodLabel = PERIODS.find(p => p.key === period)?.label ?? '';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Radar</ThemedText>
          {isActive && (
            <View style={[styles.badge, { backgroundColor: '#E53935' }]}>
              <ThemedText type="small" style={styles.badgeText}>
                Session active 🦆
              </ThemedText>
            </View>
          )}
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
          <View style={styles.statRow}>
            <ThemedView type="backgroundElement" style={styles.statCard}>
              <View style={styles.statHeader}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.statTitle}>
                  TOTAL · {periodLabel.toUpperCase()}
                </ThemedText>
                <HelpBubble text={`Total de canards sur la période « ${periodLabel} », toutes sessions confondues.`} align="left" />
              </View>
              <ThemedText type="title">{stats.total}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">canards</ThemedText>
            </ThemedView>

            {isActive && (
              <ThemedView type="backgroundElement" style={styles.statCard}>
                <View style={styles.statHeader}>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.statTitle}>
                    SESSION
                  </ThemedText>
                  <HelpBubble text="Canards détectés depuis le début de la session en cours. Remis à zéro à chaque nouvelle session." />
                </View>
                <ThemedText type="title">{incidentCount}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">canards</ThemedText>
              </ThemedView>
            )}
          </View>

          <View style={styles.statRow}>
            <ThemedView type="backgroundElement" style={styles.statCard}>
              <View style={styles.statHeader}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.statTitle}>
                  MOYENNE
                </ThemedText>
                <HelpBubble text="Nombre moyen de canards par trajet sur la période sélectionnée." align="left" />
              </View>
              <ThemedText type="title">{stats.avgPerSession}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">moy. / trajet</ThemedText>
            </ThemedView>

            <ThemedView type="backgroundElement" style={styles.statCard}>
              <View style={styles.statHeader}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.statTitle}>
                  RECORD
                </ThemedText>
                <HelpBubble text="Le nombre maximum de canards enregistrés en un seul trajet sur la période." />
              </View>
              <ThemedText type="title">{stats.record}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">sur 1 trajet</ThemedText>
            </ThemedView>
          </View>

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
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
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
    marginBottom: Spacing.two,
  },
  periodBtn: { flex: 1 },
  periodBtnInner: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  content: { gap: Spacing.two },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statCard: {
    flex: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    gap: Spacing.one,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  statTitle: {
    letterSpacing: 0.5,
  },
  helpBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpBtnText: {
    fontSize: 11,
    lineHeight: 14,
  },
  tooltip: {
    position: 'absolute',
    top: 24,
    right: 0,
    width: 220,
    padding: Spacing.two,
    borderRadius: Spacing.two,
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
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
