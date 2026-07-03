import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/AnimatedIcon';
import { SessionFab } from '@/components/SessionFab';
import { SessionProvider } from '@/contexts/sessionContext';
import { ThemePreferenceProvider, useThemeContext } from '@/contexts/themeContext';
import { initDatabase } from '@/db/client';

initDatabase();

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <RootLayoutInner />
    </ThemePreferenceProvider>
  );
}

function RootLayoutInner() {
  const { colorScheme } = useThemeContext();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SessionProvider>
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false }} />
          <SessionFab />
        </SessionProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
