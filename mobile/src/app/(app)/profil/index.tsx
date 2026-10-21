import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useWodmatchApi } from '@/lib/api';
import { gray } from '@/constants/theme';
import type { ReactNode } from 'react';

const TITLE_APP = 'wodMatch';
const RED = '#df0000';

const toUri = (url: string) =>
  url.startsWith('data:') || url.startsWith('http') ? url : `data:image/jpeg;base64,${url}`;

type BlocProps = {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  size: number;
  iconSize?: number;
  dark?: boolean;
  plus?: boolean;
  style?: object;
};

function Bloc({ icon, label, onPress, size, dark, plus, style }: BlocProps) {
  return (
    <Pressable onPress={onPress} style={[styles.bloc, style]}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }, dark && styles.circleDark]}>
        {icon}
        {plus && (
          <View style={styles.plus}>
            <Ionicons name="add" size={16} color="#000" />
          </View>
        )}
      </View>
      <Text style={styles.blocLabel}>{label}</Text>
    </Pressable>
  );
}

export default function Profil() {
  const router = useRouter();
  const api = useWodmatchApi();
  const { user } = useAuth();
  const [mainPhoto, setMainPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const taux = (user as any)?.taux_completion || 65;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      api('/images/get-user-temp-images')
        .then((remote: any) => {
          if (active && Array.isArray(remote) && remote[0]) setMainPhoto(toUri(remote[0].url));
        })
        .catch(console.error)
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const go = (path: string) => router.push(path as any);

  return (
    <View style={styles.screen}>
      {/* Partie haute */}
      <View style={styles.top}>
        <Pressable style={styles.photoWrap} onPress={() => go('/profil/edit-pictures')}>
          <View style={styles.photo}>
            {loading ? (
              <ActivityIndicator color="#505050" />
            ) : mainPhoto ? (
              <Image source={{ uri: mainPhoto }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
              <Ionicons name="person" size={64} color="#bbb" />
            )}
          </View>
          <View style={styles.flap}>
            <Text style={styles.flapText}>Complété à {taux}%</Text>
          </View>
        </Pressable>

        <View style={styles.blocs}>
          <Bloc
            icon={<Ionicons name="settings-sharp" size={24} color="#000" />}
            label="Réglages" size={56}
            onPress={() => go('/profil/settings')}
          />
          <Bloc
            icon={<MaterialCommunityIcons name="pencil" size={36} color="#000" />}
            label={'Modifier\nmon profil'} size={66} style={{ marginTop: 28 }}
            onPress={() => go('/profil/edit')}
          />
          <Bloc
            icon={<Ionicons name="camera" size={26} color="#fff" />}
            label={'Gérer mes\nphotos'} size={58} dark plus
            onPress={() => go('/profil/edit-pictures')}
          />
        </View>

        <View style={[styles.completion, { width: `${taux}%` }]} />
      </View>

      {/* Partie basse */}
      <ImageBackground
        source={require('../../../../assets/images/bg_profil.jpg')}
        style={styles.bottom}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.textBox}>
          <Text style={styles.brand}>{TITLE_APP.toUpperCase()}</Text>
          <Text style={styles.brandText}>
            Le 1er réseau pour connecter les athlètes et former des teams prêtes à performer en compétition.
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },

  top: { backgroundColor: '#fff', paddingTop: 20, paddingBottom: 24, paddingHorizontal: 28 },
  photoWrap: { alignSelf: 'center', alignItems: 'center' },
  photo: {
    width: 130, height: 130, borderRadius: 65, overflow: 'hidden', backgroundColor: '#e5e5e5',
    borderWidth: 2, borderColor: gray.g08, alignItems: 'center', justifyContent: 'center',
  },
  flap: {
    position: 'absolute', bottom: -14, backgroundColor: RED, borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  flapText: { color: '#fff', fontWeight: '800', fontSize: 11 },

  blocs: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 4 },
  bloc: { alignItems: 'center', width: 100 },
  circle: {
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#222',
    alignItems: 'center', justifyContent: 'center',
  },
  circleDark: { backgroundColor: '#222' },
  plus: {
    position: 'absolute', right: -8, bottom: -8, width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#000',
    alignItems: 'center', justifyContent: 'center',
  },
  blocLabel: { marginTop: 8, fontSize: 13, fontWeight: '700', color: '#222', textAlign: 'center' },

  completion: { position: 'absolute', left: 0, bottom: 0, height: 4, backgroundColor: RED },

  bottom: { flex: 1, justifyContent: 'center', alignItems: 'center', borderTopWidth: 1, borderTopColor: gray.g06 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.25)' },
  textBox: { paddingHorizontal: 32, alignItems: 'center' },
  brand: { fontSize: 32, fontWeight: '700', color: '#222', letterSpacing: 1 },
  brandText: { marginTop: 12, fontSize: 16, color: '#222', textAlign: 'center', lineHeight: 22, fontWeight: '500' },
});