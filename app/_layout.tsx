import '../global.css';
import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppProvider } from '../context/AppContext';
import { COLORS } from '../constants';

export default function RootLayout() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('gt_onboarding_done').then((val) => {
      setReady(true);
      if (!val) {
        // Small delay so navigator is mounted before redirect
        setTimeout(() => router.replace('/onboarding'), 50);
      }
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <StatusBar style="dark" backgroundColor={COLORS.background} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="tour-form"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="expense-form"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="agency-form"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="agencies"
            options={{
              animation: 'slide_from_right',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="tour-detail"
            options={{
              animation: 'slide_from_right',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="extra-income"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="reports"
            options={{
              animation: 'slide_from_right',
              headerShown: false,
            }}
          />
        </Stack>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
