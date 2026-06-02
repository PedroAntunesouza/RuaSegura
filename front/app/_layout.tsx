import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import * as Notifications from 'expo-notifications';
import * as SystemUI from 'expo-system-ui';
import { router, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import 'react-native-reanimated';

import { AppThemeProvider, useAppTheme } from '@/lib/app-theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function RootLayoutContent() {
  const { isDark } = useAppTheme();
  const pathname = usePathname();

  const keepAndroidNavigationBarHidden = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      await NavigationBar.setPositionAsync('absolute');
      await NavigationBar.setBehaviorAsync('overlay-swipe');
      await NavigationBar.setVisibilityAsync('hidden');
    } catch {
      // Some Android navigation modes ignore programmatic visibility changes.
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    keepAndroidNavigationBarHidden();

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        keepAndroidNavigationBarHidden();
      }
    });

    const visibilitySubscription = NavigationBar.addVisibilityListener(({ visibility }) => {
      if (visibility === 'visible') {
        setTimeout(keepAndroidNavigationBarHidden, 250);
      }
    });

    return () => {
      appStateSubscription.remove();
      visibilitySubscription.remove();
    };
  }, [keepAndroidNavigationBarHidden]);

  useEffect(() => {
    keepAndroidNavigationBarHidden();
  }, [keepAndroidNavigationBarHidden, pathname]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(isDark ? '#0F172A' : '#F4F7F6');
  }, [isDark]);

  useEffect(() => {
    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;

      if (url === '/meus-registros') {
        router.push('/meus-registros');
      }

      if (url === '/registros') {
        router.push('/registros');
      }
    }

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response?.notification) {
        redirect(response.notification);
      }
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      redirect(response.notification);
    });

    return () => subscription.remove();
  }, []);

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="capturar-foto" options={{ headerShown: false }} />
        <Stack.Screen name="escolher-localizacao" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <RootLayoutContent />
    </AppThemeProvider>
  );
}
