import { useAuth } from '@/context/AuthContext';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { Stack } from 'expo-router';
import Navbar from '../../components/Navbar';
import Footer from '@/components/Footer';

export default function AppLayout() {
  const { user } = useAuth();
  const isNewUser = !user?.has_seen_wodmatch_welcome;

  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          header: () => <Navbar />,
          contentStyle: { backgroundColor: '#f5f5f5' }, // ← cette ligne
        }}
      >
        {/* Nouveaux utilisateurs : uniquement welcome + onboarding */}
        <Stack.Protected guard={isNewUser}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="onboarding" />
        </Stack.Protected>

        {/* Utilisateurs existants : le reste de l'app */}
        <Stack.Protected guard={!isNewUser}>
          <Stack.Screen name="index" options={{ animation: 'none' }} />
          <Stack.Screen name="favoris" options={{ animation: 'none' }} />
          <Stack.Screen name="chat" options={{ animation: 'none' }} />
          <Stack.Screen name="profil" options={{ animation: 'none' }} />
        </Stack.Protected>
      </Stack>
      <Footer />
    </OnboardingProvider>
  );
}