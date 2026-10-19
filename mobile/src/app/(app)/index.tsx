import { Pressable, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { user, signOut } = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
      <Text>Connecté : {user?.email}</Text>
      <Pressable onPress={signOut}><Text>Se déconnecter</Text></Pressable>
    </View>
  );
}