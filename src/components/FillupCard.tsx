import { Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { FillUp } from '@/types/vehicle';

type Props = {
  fillup: FillUp;
  kmSince?: number;
  onEdit: () => void;
  onDelete: () => void;
};

const MONTHS = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]} ${y}`;
}

export function FillupCard({ fillup, kmSince, onEdit, onDelete }: Props) {
  const theme = useTheme();

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
      <Pressable onPress={onEdit} style={({ pressed }) => pressed && styles.pressed}>
        <ThemedView type="backgroundElement" style={[styles.card, { borderWidth: 1, borderColor: theme.backgroundSelected }]}>
          <View style={styles.left}>
            <ThemedText type="smallBold">{formatDate(fillup.date)}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {fillup.fuelType} · {fillup.liters} L{kmSince !== undefined ? ` · ${kmSince} km` : ''}
            </ThemedText>
          </View>
          <View style={styles.right}>
            <ThemedText type="smallBold">{fillup.totalPrice.toFixed(2)} €</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {fillup.isFullTank ? '⛽ Plein' : '⚡ Partiel'}
            </ThemedText>
          </View>
        </ThemedView>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    marginBottom: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
  left: {
    flex: 1,
    gap: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
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
