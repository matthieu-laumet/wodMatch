import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';

const NAV_HEIGHT = 60;

type Props = { right?: ReactNode };

export default function Navbar({ right }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.nav, { paddingTop: insets.top, height: NAV_HEIGHT + insets.top }]}>
      <Pressable onPress={() => router.push('/' as any)}>
        <Image
          source={require('../../assets/images/logo_home.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Pressable>

      <View style={styles.right}>{right}</View>
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
});