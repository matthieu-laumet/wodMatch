import { useAuth } from '@/context/AuthContext';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { Stack } from 'expo-router';
import Navbar from '../../components/Navbar';

export default function AppLayout() {
  const { user } = useAuth();
  const isNewUser = !user?.has_seen_wodmatch_welcome;

  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: true, header: () => <Navbar /> }}>
        {/* Nouveaux utilisateurs : uniquement welcome + onboarding */}
        <Stack.Protected guard={isNewUser}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="onboarding" />
        </Stack.Protected>

        {/* Utilisateurs existants : le reste de l'app */}
        <Stack.Protected guard={!isNewUser}>
          <Stack.Screen name="index" />
          {/* ajoute ici TOUS tes autres écrans de (app) */}
        </Stack.Protected>
      </Stack>
    </OnboardingProvider>
  );
}