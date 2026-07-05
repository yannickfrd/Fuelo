import { Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { EngineType, Vehicle } from '@/types/vehicle';

const VEHICLE_EMOJI: Record<string, string> = {
  Voiture: '🚗',
  Moto: '🏍️',
  Camionnette: '🚐',
  Scooter: '🛵',
  'Camping-car': '🚌',
};

const ENGINE_ICON: Record<EngineType, string> = {
  Essence:      '⛽',
  Éthanol:    '🌿',
  Diesel:       '🛢️',
  Électrique: '⚡',
  GPL:          '🔵',
};

type Props = {
  vehicle: Vehicle;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFavorite: () => void;
};

export function VehicleCard({ vehicle, onPress, onEdit, onDelete, onFavorite }: Props) {
  const theme = useTheme();
  const isFav = vehicle.isFavorite === 1;

  function RightActions(
    _progress: SharedValue<number>,
    translation: SharedValue<number>,
    swipeable: SwipeableMethods,
  ) {
    const style = useAnimatedStyle(() => ({
      transform: [{ translateX: interpolate(translation.value, [-160, 0], [0, 160], Extrapolation.CLAMP) }],
    }));

    function handleEdit() {
      swipeable.close();
      onEdit();
    }

    function handleDelete() {
      swipeable.close();
      onDelete();
    }

    return (
      <Animated.View style={[styles.actions, style]}>
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
    <Swipeable renderRightActions={RightActions} rightThreshold={40}>
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
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
      </Pressable>
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
  pressed: {
    opacity: 0.7,
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
