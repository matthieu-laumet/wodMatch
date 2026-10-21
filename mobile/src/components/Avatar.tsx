import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { gray } from '@/constants/theme';

// RN ne lit pas les SVG : Dicebear sait aussi servir du PNG
const toRaster = (uri: string) => (uri.includes('dicebear.com') ? uri.replace('/svg', '/png') : uri);

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

type Props = { uri?: string | null; name: string; size?: number };

export default function Avatar({ uri, name, size = 44 }: Props) {
  const [failed, setFailed] = useState(false);
  const box = { width: size, height: size, borderRadius: size / 2 };

  if (uri && uri.startsWith('http') && !failed) {
    return <Image source={{ uri: toRaster(uri) }} style={[styles.img, box]} onError={() => setFailed(true)} />;
  }
  return (
    <View style={[styles.fallback, box]}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  img: { backgroundColor: gray.g03 },
  fallback: { backgroundColor: gray.g03, alignItems: 'center', justifyContent: 'center' },
  initials: { fontWeight: '700', color: gray.g09 },
});