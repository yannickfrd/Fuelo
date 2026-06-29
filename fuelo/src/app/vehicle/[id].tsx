import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { FillupCard } from '@/components/fillup-card';
import { FillupModal } from '@/components/fillup-modal';
import { StatsChart } from '@/components/stats-chart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Primary, Spacing } from '@/constants/theme';
import { useFillups } from '@/hooks/use-fillups';
import { useVehicle } from '@/hooks/use-vehicle';
import { useTheme } from '@/hooks/use-theme';
import { FillUp } from '@/types/vehicle';

function computeStats(list: FillUp[]) {
  const totalSpent = list.reduce((s, f) => s + f.totalPrice, 0);
  const lastFillup = list[0] ?? null;

  const sorted = [...list].sort((a, b) => a.odometer - b.odometer);
  let lastFull: FillUp | null = null;
  let accumulated = 0;
  let totalKm = 0;
  let totalLiters = 0;

  for (const f of sorted) {
    accumulated += f.liters;
    if (f.isFullTank === 1) {
      if (lastFull !== null) {
        const km = f.odometer - lastFull.odometer;
        if (km > 0) {
          totalKm += km;
          totalLiters += accumulated;
        }
      }
      lastFull = f;
      accumulated = 0;
    }
  }

  const avgConsumption = totalKm > 0 ? (totalLiters / totalKm) * 100 : null;
  return { avgConsumption, totalSpent, lastFillup };
}

const MONTHS = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]} ${y}`;
}

export default function VehicleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const vehicleId = Number(id);

  const vehicle = useVehicle(vehicleId);
  const { fillups: list, saveFillup, removeFillup } = useFillups(vehicleId);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<FillUp | undefined>();

  function openCreate() {
    setEditing(undefined);
    setModalVisible(true);
  }

  function openEdit(fillup: FillUp) {
    setEditing(fillup);
    setModalVisible(true);
  }

  if (!vehicle) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Véhicule introuvable</ThemedText>
      </ThemedView>
    );
  }

  const isElectric = vehicle.engineType === 'Électrique';
  const stats = computeStats(list);

  const sortedAsc = [...list].sort((a, b) => a.odometer - b.odometer);
  const kmMap = new Map<number, number>();
  for (let i = 1; i < sortedAsc.length; i++) {
    kmMap.set(sortedAsc[i].id, sortedAsc[i].odometer - sortedAsc[i - 1].odometer);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <ThemedText style={styles.backArrow}>←</ThemedText>
          </Pressable>
          <View style={styles.headerTitle}>
            <ThemedText type="subtitle">{vehicle.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {vehicle.vehicleType} · {vehicle.engineType}
            </ThemedText>
          </View>
        </View>

        {isElectric ? (
          <View style={styles.electric}>
            <ThemedText type="smallBold">⚡ Recharge non supportée</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.electricSub}>
              Le suivi des véhicules électriques sera disponible prochainement.
            </ThemedText>
          </View>
        ) : (
          <>
            <ThemedView type="backgroundElement" style={styles.stats}>
              <View style={styles.statItem}>
                <ThemedText type="smallBold">
                  {stats.avgConsumption !== null ? `${stats.avgConsumption.toFixed(1)} L/100` : '—'}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">Conso moy.</ThemedText>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.backgroundSelected }]} />
              <View style={styles.statItem}>
                <ThemedText type="smallBold">
                  {stats.totalSpent > 0 ? `${stats.totalSpent.toFixed(2)} €` : '—'}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">Total dépensé</ThemedText>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.backgroundSelected }]} />
              <View style={styles.statItem}>
                <ThemedText type="smallBold">
                  {stats.lastFillup ? formatDate(stats.lastFillup.date) : '—'}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">Dernier plein</ThemedText>
              </View>
            </ThemedView>

            <FlatList
              data={list}
              keyExtractor={(item) => String(item.id)}
              ListHeaderComponent={
                <>
                  <StatsChart fillups={list} />
                  {list.length > 0 && (
                    <ThemedText type="small" themeColor="textSecondary" style={styles.listTitle}>
                      Historique
                    </ThemedText>
                  )}
                </>
              }
              ListEmptyComponent={
                <View style={styles.empty}>
                  <ThemedText type="smallBold">Aucun plein enregistré</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.emptySub}>
                    Appuyez sur + pour ajouter votre premier plein.
                  </ThemedText>
                </View>
              }
              renderItem={({ item }) => (
                <FillupCard
                  fillup={item}
                  kmSince={kmMap.get(item.id)}
                  onEdit={() => openEdit(item)}
                  onDelete={() => removeFillup(item.id)}
                />
              )}
              contentContainerStyle={styles.list}
            />
          </>
        )}
      </SafeAreaView>

      {!isElectric && (
        <Pressable style={styles.fab} onPress={openCreate}>
          <ThemedText style={styles.fabIcon}>+</ThemedText>
        </Pressable>
      )}

      <FillupModal
        visible={modalVisible}
        vehicleId={vehicleId}
        engineType={vehicle.engineType}
        fillup={editing}
        onSave={(data) => saveFillup(data, editing)}
        onDelete={() => editing && removeFillup(editing.id)}
        onClose={() => setModalVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
  },
  backBtn: {
    padding: Spacing.one,
  },
  backArrow: {
    fontSize: 24,
  },
  headerTitle: {
    flex: 1,
    gap: 2,
  },
  stats: {
    flexDirection: 'row',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    marginVertical: Spacing.one,
    marginHorizontal: Spacing.two,
  },
  list: {
    paddingBottom: 100,
  },
  listTitle: {
    marginBottom: Spacing.two,
    marginLeft: Spacing.one,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
  },
  emptySub: {
    textAlign: 'center',
  },
  electric: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  electricSub: {
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.six,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 32,
  },
});
