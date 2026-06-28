import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { EngineType, Vehicle } from '@/types/vehicle';

const VEHICLE_EMOJI: Record<string, string> = {
  Voiture: '🚗',
  Moto: '🏍️',
  Camionnette: '🚐',
  Scooter: '🛵',
  'Camping-car': '🚌',
};

const ENGINE_ICON: Record<EngineType, string> = {
  Essence:    '⛽',
  Éthanol:   '🌿',
  Diesel:     '🛢️',
  Électrique: '⚡',
  GPL:        '🔵',
};

type Props = {
  vehicle: Vehicle;
  onEdit: () => void;
  onDelete: () => void;
  onFavorite: () => void;
};

export function VehicleCard({ vehicle, onEdit, onDelete, onFavorite }: Props) {
  const swipeableRef = useRef<Swipeable>(null);
  const theme = useTheme();
  const isFav = vehicle.isFavorite === 1;

  function handleEdit() {
    swipeableRef.current?.close();
    onEdit();
  }

  function handleDelete() {
    swipeableRef.current?.close();
    onDelete();
  }

  function renderRightActions(_: unknown, dragX: Animated.AnimatedInterpolation<number>) {
    const translateX = dragX.interpolate({
      inputRange: [-160, 0],
      outputRange: [0, 160],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.actions, { transform: [{ translateX }] }]}>
        <Pressable style={[styles.actionBtn, styles.editBtn]} onPress={handleEdit}>
          <Text style={styles.actionText}>Éditer</Text>
        </Pressable>
        <Pressable style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDelete}>
          <Text style={styles.actionText}>Supprimer</Text>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} rightThreshold={40}>
      <ThemedView type="backgroundElement" style={[styles.card, { borderWidth: 1, borderColor: theme.backgroundSelected }]}>
        <View style={[styles.iconContainer, { backgroundColor: theme.backgroundSelected }]}>
          <Text style={styles.emoji}>{VEHICLE_EMOJI[vehicle.vehicleType] ?? '🚗'}</Text>
        </View>
        <View style={styles.info}>
          <ThemedText type="smallBold">{vehicle.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {vehicle.vehicleType} · {ENGINE_ICON[vehicle.engineType]} {vehicle.engineType}
          </ThemedText>
        </View>
        <Pressable onPress={onFavorite} hitSlop={8} android_ripple={null}>
          <Text style={[styles.star, isFav && styles.starActive]}>
            {isFav ? '★' : '☆'}
          </Text>
        </Pressable>
      </ThemedView>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
    borderRadius: Spacing.two,
    marginBottom: Spacing.two,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  star: {
    fontSize: 22,
    color: '#555',
  },
  starActive: {
    color: '#F5A623',
  },
  actions: {
    flexDirection: 'row',
    marginBottom: Spacing.two,
  },
  actionBtn: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: '#2D6A4F',
  },
  deleteBtn: {
    backgroundColor: '#E53935',
    borderTopRightRadius: Spacing.two,
    borderBottomRightRadius: Spacing.two,
  },
  actionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
