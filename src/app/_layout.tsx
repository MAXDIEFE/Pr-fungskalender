import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { COLORS } from '@/lib/theme';
import { EventsProvider } from '@/store/events';
import { SettingsProvider } from '@/store/settings';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <EventsProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: '#fff',
              contentStyle: { backgroundColor: COLORS.background },
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="event" options={{ presentation: 'modal', title: 'Termin' }} />
          </Stack>
        </EventsProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
