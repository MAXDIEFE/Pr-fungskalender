import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { COLORS } from '@/lib/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function icon(name: IconName) {
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color} size={size} />;
  }
  return TabIcon;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        tabBarActiveTintColor: COLORS.primary,
        sceneStyle: { backgroundColor: COLORS.background },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Monat', tabBarIcon: icon('calendar-outline') }} />
      <Tabs.Screen name="week" options={{ title: 'Woche', tabBarIcon: icon('list-outline') }} />
      <Tabs.Screen name="year" options={{ title: 'Jahr', tabBarIcon: icon('grid-outline') }} />
      <Tabs.Screen name="exams" options={{ title: 'Prüfungen', tabBarIcon: icon('school-outline') }} />
      <Tabs.Screen name="holidays" options={{ title: 'Ferien', tabBarIcon: icon('sunny-outline') }} />
    </Tabs>
  );
}
