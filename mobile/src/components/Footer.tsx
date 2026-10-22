import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { gray } from '@/constants/theme';
import { navigateGuarded } from '@/lib/leaveGuard';

const RED = '#df0000';

type Item = {
  path: string;
  family?: 'ion' | 'mi';
  icon: string;
  iconActive: string;
  size: number;
};

const ITEMS: Item[] = [
  { path: '/', icon: 'trophy-outline', iconActive: 'trophy', size: 26 },
  { path: '/favoris', icon: 'heart-outline', iconActive: 'heart', size: 26 },
  { path: '/chat', icon: 'chatbubble-outline', iconActive: 'chatbubble', size: 26 },
  { path: '/profil', icon: 'person-outline', iconActive: 'person', size: 30 },
];

// pages où le footer est masqué (comme sur le web)
const HIDDEN_PATHS = ['/profil/edit', '/profil/edit-pictures'];
const HIDDEN_PREFIXES = ['/profil/settings'];
const COMPETITION_RE = /^\/competitions\/([^/]+)/;

export default function Footer() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user?.has_seen_wodmatch_welcome) return null;
  if (HIDDEN_PATHS.includes(pathname) || HIDDEN_PREFIXES.some(p => pathname.startsWith(p))) return null;

  const competitionId = pathname.match(COMPETITION_RE)?.[1];
  const items: Item[] = competitionId
    ? [
        {
          path: `/competitions/${competitionId}`,
          family: 'mi',
          icon: 'swipe',
          iconActive: 'swipe',
          size: 28,
        },
        ...ITEMS,
      ]
    : ITEMS;

  const isActive = (path: string) => path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(path + '/');

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom - 16, 6) }]}>
      {items.map(item => {
        const active = isActive(item.path);
        const Icon: any = item.family === 'mi' ? MaterialIcons : Ionicons;

        return (
          <Pressable
            key={item.path}
            style={styles.item}
            hitSlop={8}
            onPress={() => !active && navigateGuarded(() => router.replace(item.path as any))}
          >
            <Icon
              name={active ? item.iconActive : item.icon}
              size={item.size}
              color={active ? RED : '#222'}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: gray.g06,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 64 },
});