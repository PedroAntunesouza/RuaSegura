import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/lib/app-theme';

export default function MainTabsLayout() {
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#5EEAD4' : '#0F766E',
        tabBarInactiveTintColor: isDark ? '#94A3B8' : '#64748B',
        tabBarStyle: {
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          borderTopColor: isDark ? '#334155' : '#D8E3DF',
          height: 54 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="registrar-avaria"
        options={{
          title: 'Registrar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="home-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="registros"
        options={{
          title: 'Registros',
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="list-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="mapa-detalhado"
        options={{
          title: 'Mapa detalhado',
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="map-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="meus-registros"
        options={{
          title: 'Meu perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="person-outline" size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
