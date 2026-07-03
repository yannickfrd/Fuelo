import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AnimatedIcon } from '@/components/AnimatedIcon';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { VehicleCard } from '@/components/VehicleCard';
import { VehicleModal } from '@/components/VehicleModal';
import { BottomTabInset, Primary, Spacing } from '@/constants/theme';
import { useVehicles } from '@/hooks/useVehicles';
import { Vehicle } from '@/types/vehicle';

export default function HomeScreen() {
  const router = useRouter();
  const { vehicles, saveVehicle, removeVehicle, toggleVehicleFavorite } = useVehicles();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>(undefined);

  function openCreate() {
    setEditingVehicle(undefined);
    setModalVisible(true);
  }

  function openEdit(vehicle: Vehicle) {
    setEditingVehicle(vehicle);
    setModalVisible(true);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <AnimatedIcon size={56} />
            <ThemedText type="subtitle">fuelo</ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.pageTitle}>Mes véhicules</ThemedText>
        </View>

        {vehicles.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText type="smallBold" style={styles.emptyTitle}>Aucun véhicule</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptySubtitle}>
              Ajoutez votre premier véhicule pour commencer à suivre vos pleins.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={vehicles}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <VehicleCard
                vehicle={item}
                onPress={() => router.push(`/vehicle/${item.id}`)}
                onEdit={() => openEdit(item)}
                onDelete={() => removeVehicle(item.id)}
                onFavorite={() => toggleVehicleFavorite(item)}
              />
            )}
            contentContainerStyle={styles.list}
          />
        )}
      </SafeAreaView>

      <Pressable style={styles.fab} onPress={openCreate}>
        <ThemedText style={styles.fabIcon}>+</ThemedText>
      </Pressable>

      <VehicleModal
        visible={modalVisible}
        vehicle={editingVehicle}
        onSave={(data) => saveVehicle(data, editingVehicle)}
        onDelete={() => editingVehicle && removeVehicle(editingVehicle.id)}
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
    alignItems: 'flex-start',
    gap: Spacing.two,
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pageTitle: {
    marginTop: Spacing.five,
  },
  list: {
    paddingBottom: BottomTabInset + 80,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + 80,
  },
  emptyTitle: {
    marginTop: Spacing.three,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: BottomTabInset + Spacing.three,
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
