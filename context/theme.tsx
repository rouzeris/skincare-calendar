import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useMemo } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import { Colors } from '@/constants/colors';

type ThemeMode = 'light' | 'dark' | 'auto';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemColorScheme = useNativeColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('themeMode').then((stored) => {
      if (stored && (stored === 'light' || stored === 'dark' || stored === 'auto')) {
        setThemeMode(stored as ThemeMode);
      }
      setIsLoaded(true);
    });
  }, []);

  const setTheme = async (mode: ThemeMode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem('themeMode', mode);
  };

  const activeColorScheme = useMemo(() => {
    if (themeMode === 'auto') {
      return systemColorScheme ?? 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  const colors = Colors[activeColorScheme];

  return {
    themeMode,
    setTheme,
    colors,
    colorScheme: activeColorScheme,
    isLoaded
  };
});
