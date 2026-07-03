import { StyleSheet, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Spacing } from '@/constants/theme';
import { useSessionContext } from '@/contexts/sessionContext';

export function SessionFab() {
  const { isActive, startSession, stopSession, logIncident } = useSessionContext();

  return (
    <View style={styles.wrapper}>
      {isActive && (
        <Pressable
          style={styles.incidentBtn}
          onPress={() => logIncident()}
          hitSlop={8}>
          <ThemedText style={styles.incidentIcon}>🦆</ThemedText>
        </Pressable>
      )}
      <Pressable
        style={[styles.fab, isActive ? styles.fabActive : styles.fabIdle]}
        onPress={isActive ? stopSession : startSession}>
        <ThemedText style={styles.fabIcon}>{isActive ? '⏹' : '🦆'}</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 90,
    right: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIdle: {
    backgroundColor: '#607D8B',
  },
  fabActive: {
    backgroundColor: '#E53935',
  },
  fabIcon: {
    fontSize: 26,
  },
  incidentBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  incidentIcon: {
    fontSize: 22,
  },
});
