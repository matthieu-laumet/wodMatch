import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Navbar from '../../components/Navbar';
import { BlurView } from 'expo-blur';

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Navbar />

      <ImageBackground
        source={require('../../../assets/images/wodmatch_banner.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <SafeAreaView edges={['bottom']} style={styles.container}>
            <Text style={styles.title}>Swipe ton prochain coéquipier de podium™</Text>

            <View style={styles.bottom}>
              <View style={styles.buttons}>
                <Pressable style={[styles.btn, styles.btnRegister]} onPress={() => router.push('/register')}>
                  <Text style={styles.btnRegisterText}>Créer un compte</Text>
                </Pressable>

                <Pressable onPress={() => router.push('/login')}>
                  <BlurView intensity={15} tint="dark" style={[styles.btn, styles.btnLogin]}>
                    <Text style={styles.btnLoginText}>Connexion</Text>
                  </BlurView>
                </Pressable>
              </View>

              <Text style={styles.disclaimer}>
                Les photos mettent en scène des mannequins, et sont exclusivement utilisées à des fins d’illustration
              </Text>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }, // assombrit l'image pour lire le texte
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 24, color: '#fff' },
  bottom: { gap: 12 },
  buttons: { gap: 12, marginBottom: 24 },
  btn: { height: 54, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnRegister: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#fff' },
  btnRegisterText: { color: '#222', fontWeight: '700', fontSize: 16 },
  btnLogin: { borderWidth: 2, borderColor: '#fff', overflow: 'hidden' },
  btnLoginText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  disclaimer: { fontSize: 11, color: '#787777', textAlign: 'center', marginBottom: 8 },
  screen: { flex: 1, backgroundColor: '#222' },
});