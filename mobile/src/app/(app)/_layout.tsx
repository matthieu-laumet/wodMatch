import { useAuth } from '@/context/AuthContext';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { Redirect, Stack, usePathname } from 'expo-router';
import Navbar from '../../components/Navbar';

export default function AppLayout() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isNewUser = !user?.has_seen_wodmatch_welcome;

  if (isNewUser && pathname !== '/welcome' && pathname !== '/onboarding') {
    return <Redirect href="/welcome" />;
  }
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: true, header: () => <Navbar /> }} />
    </OnboardingProvider>
  );
}