import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

import { getSetting, setSetting } from '@/repositories/settings';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextType = {
  colorScheme: 'light' | 'dark';
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  preference: 'system',
  setPreference: () => {},
});

export function useThemeContext() {
  return useContext(ThemeContext);
}

function getSystemScheme(): 'light' | 'dark' {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(getSystemScheme);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => sub.remove();
  }, []);

  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    const saved = getSetting('theme-preference');
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return 'system';
  });

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    setSetting('theme-preference', p);
  }, []);

  const colorScheme: 'light' | 'dark' =
    preference === 'system' ? systemScheme : preference;

  return (
    <ThemeContext.Provider value={{ colorScheme, preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}
