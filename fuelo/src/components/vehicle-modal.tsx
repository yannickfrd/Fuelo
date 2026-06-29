import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Primary, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  COMPATIBLE_FUELS,
  ENGINE_TYPES,
  EngineType,
  VEHICLE_TYPES,
  Vehicle,
  VehicleType,
} from '@/types/vehicle';

const ENGINE_LABELS: Record<EngineType, string> = {
  Essence:    'Essence · SP95, SP98, E10',
  Éthanol:   'Éthanol (Flex-fuel) · SP95, SP98, E10, E85',
  Diesel:     'Diesel',
  Électrique: 'Électrique',
  GPL:        'GPL · GPL + Essence',
};

const ENGINE_ICON: Record<EngineType, string> = {
  Essence:    '⛽',
  Éthanol:   '🌿',
  Diesel:     '🛢️',
  Électrique: '⚡',
  GPL:        '🔵',
};

type Props = {
  visible: boolean;
  vehicle?: Vehicle;
  onSave: (vehicle: Omit<Vehicle, 'id' | 'isFavorite'>) => void;
  onDelete?: () => void;
  onClose: () => void;
};

export function VehicleModal({ visible, vehicle, onSave, onDelete, onClose }: Props) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Voiture');
  const [engineType, setEngineType] = useState<EngineType>('Essence');

  useEffect(() => {
    if (vehicle) {
      setName(vehicle.name);
      setVehicleType(vehicle.vehicleType);
      setEngineType(vehicle.engineType);
    } else {
      setName('');
      setVehicleType('Voiture');
      setEngineType('Essence');
    }
  }, [vehicle, visible]);

  function handleSave() {
    if (!name.trim()) {
      Alert.alert('Nom requis', 'Veuillez saisir un nom pour le véhicule.');
      return;
    }
    onSave({ name: name.trim(), vehicleType, engineType });
    onClose();
  }

  function handleDelete() {
    Alert.alert('Supprimer', `Supprimer "${name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => { onDelete?.(); onClose(); } },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <Pressable onPress={onClose}>
            <ThemedText type="link" themeColor="textSecondary">Annuler</ThemedText>
          </Pressable>
          <ThemedText type="smallBold">{vehicle ? 'Modifier' : 'Nouveau véhicule'}</ThemedText>
          <Pressable onPress={handleSave}>
            <ThemedText type="smallBold" style={{ color: Primary }}>Enregistrer</ThemedText>
          </Pressable>
        </ThemedView>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ThemedText type="small" themeColor="textSecondary" style={styles.label}>NOM</ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement }]}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Ma voiture"
            placeholderTextColor={theme.textSecondary}
            autoFocus={!vehicle}
          />

          <ThemedText type="small" themeColor="textSecondary" style={styles.label}>TYPE DE VÉHICULE</ThemedText>
          <ThemedView type="backgroundElement" style={styles.optionGroup}>
            {VEHICLE_TYPES.map((type, i) => (
              <Pressable key={type} onPress={() => setVehicleType(type)}>
                <ThemedView
                  style={[styles.option, i < VEHICLE_TYPES.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.backgroundSelected }]}
                  type={vehicleType === type ? 'backgroundSelected' : 'backgroundElement'}>
                  <ThemedText type="small">{type}</ThemedText>
                  {vehicleType === type && <ThemedText style={{ color: Primary }}>✓</ThemedText>}
                </ThemedView>
              </Pressable>
            ))}
          </ThemedView>

          <ThemedText type="small" themeColor="textSecondary" style={styles.label}>TYPE DE MOTEUR</ThemedText>
          <ThemedView type="backgroundElement" style={styles.optionGroup}>
            {ENGINE_TYPES.map((type, i) => (
              <Pressable key={type} onPress={() => setEngineType(type)}>
                <ThemedView
                  style={[styles.option, i < ENGINE_TYPES.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.backgroundSelected }]}
                  type={engineType === type ? 'backgroundSelected' : 'backgroundElement'}>
                  <View style={styles.engineRow}>
                    <ThemedText style={styles.engineIcon}>{ENGINE_ICON[type]}</ThemedText>
                    <View style={styles.engineInfo}>
                      <ThemedText type="small">{type === 'Éthanol' ? 'Éthanol (Flex-fuel)' : type}</ThemedText>
                      {COMPATIBLE_FUELS[type].length > 0 && (
                        <ThemedText type="small" themeColor="textSecondary" style={styles.compatible}>
                          {COMPATIBLE_FUELS[type].join(', ')}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                  {engineType === type && <ThemedText style={{ color: Primary }}>✓</ThemedText>}
                </ThemedView>
              </Pressable>
            ))}
          </ThemedView>

          {vehicle && (
            <Pressable onPress={handleDelete} style={styles.deleteButton}>
              <ThemedText type="small" style={styles.deleteText}>Supprimer le véhicule</ThemedText>
            </Pressable>
          )}
          <View style={{ height: Spacing.six }} />
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  label: {
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
    marginLeft: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  optionGroup: {
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  engineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  engineIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  engineInfo: {
    flex: 1,
    gap: 2,
  },
  compatible: {
    fontSize: 11,
  },
  deleteButton: {
    marginTop: Spacing.five,
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  deleteText: {
    color: '#E53935',
  },
});
