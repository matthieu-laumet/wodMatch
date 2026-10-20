import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  SharedValue, runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { useWodmatchApi } from '../lib/api';
import { MAX_PHOTOS } from '../constants/config';
import CropModal from './CropModal';
import { File } from 'expo-file-system';

type Photo = { id: string; filename: string; uri: string };
type Props = {
  setBtnText: (t: string) => void;
  setIsDisabled: (b: boolean) => void;
  btnText?: string;
};

const COLS = 3;
const GAP = 8;

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// le backend renvoie du base64 (ou une data URL) dans `url`
const toUri = (url: string) =>
  url.startsWith('data:') || url.startsWith('http') ? url : `data:image/jpeg;base64,${url}`;

// position (x, y) d'une case selon son index dans la grille
const slotPos = (index: number, w: number, h: number) => {
  'worklet';
  return { x: (index % COLS) * (w + GAP), y: Math.floor(index / COLS) * (h + GAP) };
};

type CellProps = {
  photo: Photo;
  index: number;
  count: number;
  w: number;
  h: number;
  positions: SharedValue<Record<string, number>>;
  onDrop: (ids: string[]) => void;
  onRemove: (id: string) => void;
};

function DraggablePhoto({ photo, index, count, w, h, positions, onDrop, onRemove }: CellProps) {
  const start = slotPos(index, w, h);
  const tx = useSharedValue(start.x);
  const ty = useSharedValue(start.y);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const id = photo.id;

  // quand la case de cette photo change (une autre photo a été déplacée), on glisse vers sa nouvelle place
  useAnimatedReaction(
    () => positions.value[id],
    idx => {
      if (idx === undefined || isDragging.value) return;
      const p = slotPos(idx, w, h);
      tx.value = withTiming(p.x, { duration: 200 });
      ty.value = withTiming(p.y, { duration: 200 });
    },
  );

  const pan = Gesture.Pan()
    .activateAfterLongPress(250)
    .onStart(() => {
      isDragging.value = true;
      startX.value = tx.value;
      startY.value = ty.value;
    })
    .onUpdate(e => {
      tx.value = startX.value + e.translationX;
      ty.value = startY.value + e.translationY;

      // case sous le doigt
      const col = Math.max(0, Math.min(COLS - 1, Math.round(tx.value / (w + GAP))));
      const row = Math.max(0, Math.round(ty.value / (h + GAP)));
      const target = Math.min(row * COLS + col, count - 1);
      const current = positions.value[id];

      if (target !== current) {
        // on échange les deux photos
        const next = { ...positions.value };
        for (const key in next) {
          if (next[key] === target) next[key] = current;
        }
        next[id] = target;
        positions.value = next;
      }
    })
    .onFinalize(() => {
      if (!isDragging.value) return;
      isDragging.value = false;

      const map = positions.value;
      const p = slotPos(map[id], w, h);
      tx.value = withTiming(p.x, { duration: 150 });
      ty.value = withTiming(p.y, { duration: 150 });

      // l'ordre est calculé ICI (thread UI) puis passé en argument
      const ids = Object.keys(map).sort((a, b) => map[a] - map[b]);
      runOnJS(onDrop)(ids);
    });

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: withTiming(isDragging.value ? 1.06 : 1, { duration: 120 }) },
    ],
    zIndex: isDragging.value ? 100 : 0,
    opacity: isDragging.value ? 0.9 : 1,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, styles.abs, { width: w, height: h }, style]}>
        <Image source={{ uri: photo.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <Pressable style={[styles.chip, { right: 6 }]} onPress={() => onRemove(id)} hitSlop={8}>
          <Ionicons name="close" size={14} color="#fff" />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

export default function HandlePhotos({ setBtnText, setIsDisabled, btnText = 'Suivant' }: Props) {
  const api = useWodmatchApi();
  const { width } = useWindowDimensions();

  // padding horizontal 24 * 2 + 2 gaps de 8
  const cellWidth = Math.floor((width - 48 - GAP * (COLS - 1)) / COLS);
  const cellHeight = Math.floor(cellWidth * (4 / 3));

  const [photos, setPhotos] = useState<Photo[]>([]);
  type Picked = { uri: string; width: number; height: number };
  const [cropQueue, setCropQueue] = useState<Picked[]>([]);
  const cropSource = cropQueue[0] ?? null; // photo en cours de recadrage
  const [loadingCount, setLoadingCount] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const busy = useRef(false); // évite deux suppressions / réordonnancements en parallèle
  const photosRef = useRef<Photo[]>([]);
  photosRef.current = photos;

  // index de chaque photo (id -> case), partagé avec toutes les cellules
  const positions = useSharedValue<Record<string, number>>({});

  const syncPositions = (list: Photo[]) => {
    const map: Record<string, number> = {};
    list.forEach((p, i) => (map[p.id] = i));
    positions.value = map;
  };

  // la liste de photos fait foi : on resynchronise les positions à chaque changement
  useEffect(() => {
    syncPositions(photos);
  }, [photos]);

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

  const addPhoto = async () => {
    const remaining = MAX_PHOTOS - photos.length - loadingCount;
    if (remaining <= 0) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: remaining, // impossible d'en choisir plus que la place restante
      orderedSelection: true,    // iOS : numérote dans l'ordre de sélection (ignoré si non supporté)
      quality: 1,
    });
    if (res.canceled) return;

    const picked = res.assets.map(a => ({ uri: a.uri, width: a.width, height: a.height }));
    setBatchTotal(picked.length);
    setCropQueue(picked);
  };

  const uploadPhoto = async (uri: string) => {
    const slot = photos.length + loadingCount;

    setLoadingCount(c => c + 1);
    try {
      const form = new FormData();
      form.append('files', new File(uri), `photo-${Date.now()}.jpg`);
      form.append('slot', String(slot));

      const results = await api('/images/upload-temp-images', { method: 'POST', body: form });
      setPhotos(p => [...p, { id: uid(), filename: results[0].filename, uri }]);
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

    const previous = photosRef.current;
    const photo = previous.find(p => p.id === id);
    const next = previous.filter(p => p.id !== id);
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

  // appelé quand on relâche une photo : applique le nouvel ordre puis l'envoie au serveur
  const handleDrop = async (ids: string[]) => {
    const previous = photosRef.current;
    const order = ids
      .map(id => previous.find(p => p.id === id))
      .filter(Boolean) as Photo[];

    if (order.length !== previous.length) {
      syncPositions(previous);
      return;
    }

    const changed = order.some((p, i) => p.id !== previous[i].id);
    if (!changed) return;

    if (busy.current) {
      syncPositions(previous); // opération en cours : on annule le déplacement
      return;
    }
    busy.current = true;

    setPhotos(order);
    try {
      const results = await reorderRemote(order);
      setPhotos(order.map((p, i) => ({ ...p, filename: results[i].newFilename })));
    } catch (e: any) {
      console.error('Erreur réordonnancement:', e);
      Alert.alert('Erreur', "Impossible d'enregistrer l'ordre : " + e.message);
      setPhotos(previous); // rollback
    } finally {
      busy.current = false;
    }
  };

  const totalUsed = photos.length + loadingCount;
  const showAdd = totalUsed < MAX_PHOTOS;
  const slots = totalUsed + (showAdd ? 1 : 0);
  const rows = Math.max(1, Math.ceil(slots / COLS));
  const gridHeight = rows * cellHeight + (rows - 1) * GAP;
  const cell = { width: cellWidth, height: cellHeight };

  return (
    <View>
      <Text style={styles.title}>Ajoute tes photos récentes</Text>
      <Text style={styles.text}>
        Montre à une team pourquoi elle doit te choisir. Sélectionne des photos qui révèlent tes talents d'athlète.
      </Text>
      <Text style={styles.count}>{totalUsed}/{MAX_PHOTOS} photos</Text>

      {initialLoading ? (
        <ActivityIndicator color="#222" style={{ marginTop: 32 }} />
      ) : (
        <>
          <View style={{ height: gridHeight }}>
            {photos.map((p, i) => (
              <DraggablePhoto
                key={p.id}
                photo={p}
                index={i}
                count={photos.length}
                w={cellWidth}
                h={cellHeight}
                positions={positions}
                onDrop={handleDrop}
                onRemove={remove}
              />
            ))}

            {Array.from({ length: loadingCount }).map((_, i) => {
              const pos = slotPos(photos.length + i, cellWidth, cellHeight);
              return (
                <View
                  key={`loading-${i}`}
                  style={[styles.slot, styles.abs, styles.center, cell, { left: pos.x, top: pos.y }]}
                >
                  <ActivityIndicator color="#505050" />
                </View>
              );
            })}

            {showAdd && (() => {
              const pos = slotPos(totalUsed, cellWidth, cellHeight);
              return (
                <Pressable
                  onPress={addPhoto}
                  style={[styles.slot, styles.add, styles.abs, styles.center, cell, { left: pos.x, top: pos.y }]}
                >
                  <Text style={styles.plus}>+</Text>
                </Pressable>
              );
            })()}
          </View>

          {photos.length > 1 && (
            <Text style={styles.hint}>
              Pour réorganiser tes photos, maintiens le doigt sur une photo puis glisse-la à sa nouvelle place.
            </Text>
          )}
        </>
      )}
      {cropSource && (
        <CropModal
          key={cropSource.uri}
          uri={cropSource.uri}
          imgWidth={cropSource.width}
          imgHeight={cropSource.height}
          progress={batchTotal > 1 ? `${batchTotal - cropQueue.length + 1}/${batchTotal}` : undefined}
          onConfirm={uri => {
            setCropQueue(q => q.slice(1));
            uploadPhoto(uri);
          }}
          onCancel={() => setCropQueue([])}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '600', color: '#222', marginBottom: 8 },
  text: { fontSize: 16, color: '#222', marginBottom: 24 },

  abs: { position: 'absolute', left: 0, top: 0 },
  center: { alignItems: 'center', justifyContent: 'center' },
  count: { fontSize: 14, color: '#555', marginBottom: 12 },
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
  add: { backgroundColor: '#fff', borderColor: '#505050' },
  plus: { fontSize: 28, color: '#111' },

  hint: { marginTop: 16, fontSize: 14, color: '#555' },
});