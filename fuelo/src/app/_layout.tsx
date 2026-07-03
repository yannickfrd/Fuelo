import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/AnimatedIcon';
import { SessionFab } from '@/components/SessionFab';
import { SessionProvider } from '@/contexts/sessionContext';
import { initDatabase } from '@/db/client';
import { useColorScheme } from '@/hooks/useColorScheme';

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
