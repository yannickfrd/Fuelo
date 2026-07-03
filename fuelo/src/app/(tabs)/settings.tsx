import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Primary, Spacing } from '@/constants/theme';
import { ThemePreference, useThemeContext } from '@/contexts/themeContext';
import { useTheme } from '@/hooks/useTheme';

const THEME_OPTIONS: { key: ThemePreference; label: string; description: string }[] = [
  { key: 'system',  label: 'Automatique',  description: 'Suit le réglage de ton téléphone' },
  { key: 'light',   label: 'Clair',        description: 'Toujours en mode clair' },
  { key: 'dark',    label: 'Sombre',       description: 'Toujours en mode sombre' },
];

export default function SettingsScreen() {
  const { preference, setPreference } = useThemeContext();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText type="subtitle" style={styles.title}>Paramètres</ThemedText>

        <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
          APPARENCE
        </ThemedText>

        <View style={styles.optionGroup}>
          {THEME_OPTIONS.map((opt, i) => {
            const isSelected = preference === opt.key;
            const isFirst = i === 0;
            const isLast = i === THEME_OPTIONS.length - 1;
            return (
              <Pressable key={opt.key} onPress={() => setPreference(opt.key)}>
                <ThemedView
                  type="backgroundElement"
                  style={[
                    styles.option,
                    isFirst && styles.optionFirst,
                    isLast && styles.optionLast,
                    !isLast && { borderBottomWidth: 1, borderBottomColor: theme.backgroundSelected },
                  ]}>
                  <View style={styles.optionText}>
                    <ThemedText type="default">{opt.label}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">{opt.description}</ThemedText>
                  </View>
                  {isSelected && (
                    <ThemedText style={{ color: Primary, fontSize: 18 }}>✓</ThemedText>
                  )}
                </ThemedView>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three },
  title: { marginTop: Spacing.two, marginBottom: Spacing.four },
  sectionLabel: { marginBottom: Spacing.two, letterSpacing: 0.5 },
  optionGroup: { borderRadius: Spacing.two, overflow: 'hidden' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  optionFirst: { borderTopLeftRadius: Spacing.two, borderTopRightRadius: Spacing.two },
  optionLast: { borderBottomLeftRadius: Spacing.two, borderBottomRightRadius: Spacing.two },
  optionText: { flex: 1, gap: Spacing.one },
});
