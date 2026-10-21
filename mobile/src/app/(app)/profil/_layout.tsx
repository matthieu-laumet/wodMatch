import { Stack } from 'expo-router';

// Le header (Navbar) est déjà fourni par le Stack parent de (app)
export default function ProfilLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#f5f5f5' } }} />;
}