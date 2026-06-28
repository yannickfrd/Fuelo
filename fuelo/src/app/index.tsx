import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VehicleCard } from '@/components/vehicle-card';
import { VehicleModal } from '@/components/vehicle-modal';
import { BottomTabInset, Primary, Spacing } from '@/constants/theme';
import { addVehicle, deleteVehicle, getVehicles, toggleFavorite, updateVehicle } from '@/services/database';
import { Vehicle } from '@/types/vehicle';

export default function HomeScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => getVehicles());
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>(undefined);

  const refresh = useCallback(() => setVehicles(getVehicles()), []);

  function openCreate() {
    setEditingVehicle(undefined);
    setModalVisible(true);
  }

  function openEdit(vehicle: Vehicle) {
    setEditingVehicle(vehicle);
    setModalVisible(true);
  }

  function handleSave(data: Omit<Vehicle, 'id' | 'isFavorite'>) {
    if (editingVehicle) {
      updateVehicle({ ...data, id: editingVehicle.id, isFavorite: editingVehicle.isFavorite });
    } else {
      addVehicle(data);
    }
    refresh();
  }

  function handleDelete() {
    if (editingVehicle) {
      deleteVehicle(editingVehicle.id);
      refresh();
    }
  }

  function handleFavorite(vehicle: Vehicle) {
    toggleFavorite(vehicle.id, vehicle.isFavorite !== 1);
    refresh();
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText type="title" style={styles.heading}>Mes véhicules</ThemedText>

        {vehicles.length === 0 ? (
          <View style={styles.empty}>
            <AnimatedIcon />
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
                onEdit={() => openEdit(item)}
                onDelete={() => { deleteVehicle(item.id); refresh(); }}
                onFavorite={() => handleFavorite(item)}
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
        onSave={handleSave}
        onDelete={handleDelete}
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
  heading: {
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
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
