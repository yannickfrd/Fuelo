import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { SessionFab } from '@/components/session-fab';
import { SessionProvider } from '@/contexts/session-context';
import { initDatabase } from '@/db/client';
import { useColorScheme } from '@/hooks/use-color-scheme';

initDatabase();

export default function RootLayout() {
  const colorScheme = useColorScheme();
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
