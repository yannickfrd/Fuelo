import { Colors } from '@/constants/theme';
import { useThemeContext } from '@/contexts/themeContext';

export function useTheme() {
  const { colorScheme } = useThemeContext();
  return Colors[colorScheme];
}
