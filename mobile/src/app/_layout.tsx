import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { FiltersProvider } from '../context/FiltersContext';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const isLoggedIn = !!user?.email;

  useEffect(() => {
    if (!isLoggedIn) return;
    const handle = (r: Notifications.NotificationResponse) => {
      const data = r.notification.request.content.data;
      if (data?.type === 'like') router.push('/'); // remplace par ta vraie route  -> Likes reçus » ou « Mes teams ».
    };
    // App ouverte ou en arrière-plan
    const sub = Notifications.addNotificationResponseReceivedListener(handle);
    // App fermée, lancée par le tap sur la notif
    Notifications.getLastNotificationResponseAsync().then(r => r && handle(r));
    return () => sub.remove();
  }, [isLoggedIn]);

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FiltersProvider>
            <RootNavigator />
          </FiltersProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}