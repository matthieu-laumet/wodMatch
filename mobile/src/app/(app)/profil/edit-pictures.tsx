import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import HandlePhotos from '@/components/HandlePhotos';

export default function EditPictures() {
  const router = useRouter();
  // HandlePhotos pilote un bouton "Suivant" côté onboarding : ici on n'en a pas besoin
  const [, setBtnText] = useState('');
  const [, setIsDisabled] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back-circle-outline" size={34} color="#222" />
        </Pressable>
      </View>
      <HandlePhotos setBtnText={setBtnText} setIsDisabled={setIsDisabled} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 40 },
  header: { marginBottom: 16 },
});