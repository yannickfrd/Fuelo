import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable, TouchableOpacity } from 'react-native-gesture-handler';

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
  const swipeableRef = useRef<Swipeable>(null);
  const theme = useTheme();

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
      <TouchableOpacity onPress={handleEdit} activeOpacity={0.7}>
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
      </TouchableOpacity>
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
