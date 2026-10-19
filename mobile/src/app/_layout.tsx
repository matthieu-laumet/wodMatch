import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootNavigator() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;

  const isLoggedIn = !!user?.email;

  return (
    <Stack screenOptions={{ headerShown: false }}>
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
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}