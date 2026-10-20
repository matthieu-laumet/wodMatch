import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

const NAV_HEIGHT = 60;

type Props = { right?: ReactNode };

export default function Navbar({ right }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const confirmSignOut = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <View style={[styles.nav, { paddingTop: insets.top, height: NAV_HEIGHT + insets.top }]}>
      <Pressable onPress={() => router.push('/' as any)}>
        <Image
          source={require('../../assets/images/logo_home.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Pressable>

      <View style={styles.right}>
        {right}
        {user && (
          <Pressable
            onPress={confirmSignOut}
            style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Se déconnecter"
          >
            <Text style={styles.logoutText}>Déconnexion</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    backgroundColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logo: { width: 90, height: 36 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fff',
  },
  logoutBtnPressed: { opacity: 0.6 },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});