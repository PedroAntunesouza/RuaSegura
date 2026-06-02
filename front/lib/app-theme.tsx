import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

type AppThemeMode = 'light' | 'dark';

type AppThemeContextValue = {
  isDark: boolean;
  mode: AppThemeMode;
  toggleTheme: () => void;
};

const THEME_STORAGE_KEY = '@ruasegura:theme-mode';

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<AppThemeMode>('light');

  useEffect(() => {
    async function loadTheme() {
      const storedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);

      if (storedMode === 'dark' || storedMode === 'light') {
        setMode(storedMode);
      }
    }

    loadTheme();
  }, []);

  const value = useMemo(
    () => ({
      isDark: mode === 'dark',
      mode,
      toggleTheme: () => {
        setMode((current) => {
          const nextMode = current === 'dark' ? 'light' : 'dark';
          AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
          return nextMode;
        });
      },
    }),
    [mode],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const theme = useContext(AppThemeContext);

  if (!theme) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }

  return theme;
}
