import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useWodmatchApi } from '../lib/api';
import { MAX_PHOTOS } from '../constants/config';

type Photo = { id: string; filename: string; uri: string };
type Props = {
  setBtnText: (t: string) => void;
  setIsDisabled: (b: boolean) => void;
  btnText?: string;
};

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// le backend renvoie du base64 (ou une data URL) dans `url`
const toUri = (url: string) =>
  url.startsWith('data:') || url.startsWith('http') ? url : `data:image/jpeg;base64,${url}`;

export default function HandlePhotos({ setBtnText, setIsDisabled, btnText = 'Suivant' }: Props) {
  const api = useWodmatchApi();
  const { width } = useWindowDimensions();

  // padding horizontal 24 * 2 + 2 gaps de 8
  const cellWidth = Math.floor((width - 48 - 16) / 3);
  const cellHeight = Math.floor(cellWidth * (4 / 3));

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingCount, setLoadingCount] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const busy = useRef(false); // évite deux suppressions / réordonnancements en parallèle

  // bouton "Suivant" du parent
  useEffect(() => {
    setBtnText(btnText);
    setIsDisabled(photos.length === 0 || loadingCount > 0);
  }, [photos, loadingCount]);

  // GET /images/get-user-temp-images
  useEffect(() => {
    (async () => {
      try {
        const remote = await api('/images/get-user-temp-images');
        if (Array.isArray(remote)) {
          setPhotos(remote.map((p: any) => ({ id: uid(), filename: p.filename, uri: toUri(p.url) })));
        }
      } catch (e: any) {
        Alert.alert('Erreur', e.message);
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  // POST /images/reorder-temp-images
  const reorderRemote = (list: Photo[]) =>
    api('/images/reorder-temp-images', {
      method: 'POST',
      body: JSON.stringify({ filenames: list.map(p => p.filename) }),
    });

  // POST /images/upload-temp-images (champs `files` et `slot`)
  const addPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true, // recadrage natif
      aspect: [3, 4],
      quality: 0.8,
    });
    if (res.canceled) return;

    const asset = res.assets[0];
    const slot = photos.length + loadingCount;

    setLoadingCount(c => c + 1);
    try {
      const form = new FormData();
      form.append('files', {
        uri: asset.uri,
        name: `photo-${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);
      form.append('slot', String(slot));

      const results = await api('/images/upload-temp-images', { method: 'POST', body: form });
      setPhotos(p => [...p, { id: uid(), filename: results[0].filename, uri: asset.uri }]);
    } catch (e: any) {
      Alert.alert('Erreur upload', e.message);
    } finally {
      setLoadingCount(c => c - 1);
    }
  };

  // DELETE /images/delete-temp-image/:filename puis reorder
  const doRemove = async (id: string) => {
    if (busy.current) return;
    busy.current = true;

    const previous = photos;
    const photo = photos.find(p => p.id === id);
    const next = photos.filter(p => p.id !== id);
    setPhotos(next); // optimistic update

    try {
      if (photo?.filename) {
        await api(`/images/delete-temp-image/${encodeURIComponent(photo.filename)}`, { method: 'DELETE' });
        if (next.length > 0) {
          const results = await reorderRemote(next);
          setPhotos(next.map((p, i) => ({ ...p, filename: results[i].newFilename })));
        }
      }
    } catch (e: any) {
      console.error('Erreur suppression:', e);
      setPhotos(previous); // rollback
    } finally {
      busy.current = false;
    }
  };

  const remove = (id: string) =>
    Alert.alert('Supprimer cette photo ?', undefined, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => doRemove(id) },
    ]);

  // remplace le drag and drop : décale la photo d'un cran vers la gauche
  const moveLeft = async (index: number) => {
    if (index === 0 || busy.current) return;
    busy.current = true;

    const previous = photos;
    const next = [...photos];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setPhotos(next);

    try {
      const results = await reorderRemote(next);
      setPhotos(next.map((p, i) => ({ ...p, filename: results[i].newFilename })));
    } catch (e: any) {
      console.error('Erreur réordonnancement:', e);
      setPhotos(previous);
    } finally {
      busy.current = false;
    }
  };

  const totalUsed = photos.length + loadingCount;
  const cell = { width: cellWidth, height: cellHeight };

  return (
    <View>
      <Text style={styles.title}>Ajoute tes photos récentes</Text>
      <Text style={styles.text}>
        Montre à une team pourquoi elle doit te choisir. Sélectionne des photos qui révèlent tes talents d'athlète.
      </Text>

      {initialLoading ? (
        <ActivityIndicator color="#222" style={{ marginTop: 32 }} />
      ) : (
        <>
          <View style={styles.grid}>
            {photos.map((p, i) => (
              <View key={p.id} style={[styles.card, cell]}>
                <Image source={{ uri: p.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />

                <Pressable style={[styles.chip, { right: 6 }]} onPress={() => remove(p.id)} hitSlop={8}>
                  <Ionicons name="close" size={14} color="#fff" />
                </Pressable>

                {i > 0 && (
                  <Pressable style={[styles.chip, { left: 6 }]} onPress={() => moveLeft(i)} hitSlop={8}>
                    <Ionicons name="chevron-back" size={14} color="#fff" />
                  </Pressable>
                )}
              </View>
            ))}

            {Array.from({ length: loadingCount }).map((_, i) => (
              <View key={`loading-${i}`} style={[styles.slot, cell, styles.center]}>
                <ActivityIndicator color="#505050" />
              </View>
            ))}

            {totalUsed < MAX_PHOTOS && (
              <Pressable onPress={addPhoto} style={[styles.slot, styles.add, cell, styles.center]}>
                <Text style={styles.plus}>+</Text>
              </Pressable>
            )}
          </View>

          {photos.length > 1 && (
            <Text style={styles.hint}>
              Pour réorganiser tes photos, appuie sur la flèche en bas à gauche d'une photo pour la décaler vers la gauche.
            </Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '600', color: '#222', marginBottom: 8 },
  text: { fontSize: 16, color: '#222', marginBottom: 24 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  center: { alignItems: 'center', justifyContent: 'center' },

  card: { borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: '#000' },
  chip: {
    position: 'absolute',
    bottom: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },

  slot: { borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: '#bbb' },
  add: { backgroundColor: '#f3f3f3', borderColor: '#505050' },
  plus: { fontSize: 28, color: '#111' },

  hint: { marginTop: 16, fontSize: 14, color: '#555' },
});