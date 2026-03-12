import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import { Colors } from '@/constants/colors';

type ThemeMode = 'light' | 'dark' | 'auto';
type AppSettings = {
  showDetailedConflicts: boolean;
};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemColorScheme = useNativeColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [isLoaded, setIsLoaded] = useState(false);
  const [appSettings, setAppSettingsState] = useState<AppSettings>({ showDetailedConflicts: true });

  useEffect(() => {
    void Promise.all([
      AsyncStorage.getItem('themeMode'),
      AsyncStorage.getItem('appSettings'),
    ]).then(([storedTheme, storedSettings]) => {
      if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'auto')) {
        setThemeMode(storedTheme as ThemeMode);
      }
      if (storedSettings) {
        try {
          const parsed = JSON.parse(storedSettings) as Partial<AppSettings>;
          setAppSettingsState(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.log('[Theme] failed to parse appSettings', e);
        }
      }
      setIsLoaded(true);
    });
  }, []);

  const setTheme = useCallback(async (mode: ThemeMode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem('themeMode', mode);
  }, []);

  const setAppSettings = useCallback(async (updates: Partial<AppSettings>) => {
    setAppSettingsState(prev => {
      const next = { ...prev, ...updates };
      void AsyncStorage.setItem('appSettings', JSON.stringify(next));
      return next;
    });
  }, []);

  const activeColorScheme = useMemo(() => {
    if (themeMode === 'auto') {
      return systemColorScheme ?? 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  const colors = Colors[activeColorScheme];

  return useMemo(() => ({
    themeMode,
    setTheme,
    colors,
    colorScheme: activeColorScheme,
    isLoaded,
    showDetailedConflicts: appSettings.showDetailedConflicts,
    setAppSettings,
  }), [themeMode, setTheme, colors, activeColorScheme, isLoaded, appSettings.showDetailedConflicts, setAppSettings]);
});
