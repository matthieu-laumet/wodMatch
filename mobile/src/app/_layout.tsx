import { useEffect } from 'react';
import { SplashScreen, Stack, router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { FiltersProvider } from '../context/FiltersContext';
import { useFonts } from 'expo-font';
import { Anton_400Regular } from '@expo-google-fonts/anton';
import { BarlowCondensed_800ExtraBold_Italic } from '@expo-google-fonts/barlow-condensed';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

SplashScreen.preventAutoHideAsync(); 

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
  const [fontsLoaded, fontError] = useFonts({
    Anton_400Regular, // tu peux la retirer si tu ne l'utilises plus ailleurs
    BarlowCondensed_800ExtraBold_Italic,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

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