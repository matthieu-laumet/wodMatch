import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { Tag } from '../types/competition';

type Props = { tags: Tag[]; activeSlug?: string | null; onPress: (slug: string) => void };

const FADE_WIDTH = 48;

export default function Tags({ tags, activeSlug, onPress }: Props) {
  const [layoutW, setLayoutW] = useState(0);
  const [contentW, setContentW] = useState(0);
  const [offsetX, setOffsetX] = useState(0);

  // on affiche le fondu seulement s'il reste des tags à droite
  const hasMore = contentW > layoutW + 1 && offsetX + layoutW < contentW - 8;

  return (
    <View style={s.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={tags}
        keyExtractor={t => String(t.id_tag)}
        contentContainerStyle={s.list}
        onLayout={e => setLayoutW(e.nativeEvent.layout.width)}
        onContentSizeChange={w => setContentW(w)}
        onScroll={e => setOffsetX(e.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <Pressable
            style={[s.item, activeSlug === item.tag_slug && s.active]}
            onPress={() => onPress(item.tag_slug)}
          >
            <Image source={{ uri: item.tag_img! }} style={s.icon} contentFit="contain" />
            <Text style={s.label}>{item.tag_name.replace(' persons', '')}</Text>
          </Pressable>
        )}
      />
      {hasMore && (
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0)', '#fff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.fade}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginTop: 24 },
  list: { gap: 26, paddingHorizontal: '7%' },
  item: { alignItems: 'center', paddingBottom: 10, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  active: { borderBottomColor: '#222' },
  icon: { width: 32, height: 30, opacity: 0.8 },
  label: { fontSize: 11, fontWeight: '600', color: '#696969', marginTop: 4 },
  fade: { position: 'absolute', right: 0, top: 0, bottom: 0, width: FADE_WIDTH },
});