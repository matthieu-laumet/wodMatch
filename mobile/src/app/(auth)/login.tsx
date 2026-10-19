import { useState } from 'react';
import {
  ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const RED = '#cc0000';
const DARK = '#222';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn(email, pwd);
      // Stack.Protected bascule vers (app) tout seul
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require('../../../assets/images/logo_home_noir.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Onglets */}
          <View style={styles.tabs}>
            <View style={[styles.tab, styles.tabActive]}>
              <Text style={[styles.tabText, styles.tabTextActive]}>SE CONNECTER</Text>
            </View>
            <Link href="/register" asChild>
              <Pressable style={styles.tab}>
                <Text style={styles.tabText}>S'INSCRIRE</Text>
              </Pressable>
            </Link>
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Text style={styles.label}>Adresse e-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="username"
            autoComplete="email"
          />

          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.pwdWrapper}>
            <TextInput
              style={[styles.input, styles.pwdInput]}
              value={pwd}
              onChangeText={setPwd}
              secureTextEntry={!showPwd}
              autoCapitalize="none"
              textContentType="password"
              autoComplete="password"
              onSubmitEditing={handleSubmit}
            />
            <Pressable
              style={styles.eye}
              onPress={() => setShowPwd(v => !v)}
              hitSlop={10}
            >
              <Ionicons
                name={showPwd ? 'eye-outline' : 'eye-off-outline'}
                size={22}
                color={DARK}
              />
            </Pressable>
          </View>

          <Pressable
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Se connecter</Text>}
          </Pressable>

          <Link href="/forgot-password" asChild>
            <Pressable style={styles.forgot}>
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </Pressable>
          </Link>

          <View style={styles.divider} />

          <Text style={styles.footer}>
            Pas encore de compte ?{' '}
            <Link href="/register" style={styles.footerLink}>
              Créez votre compte
            </Link>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingBottom: 40 },

  logo: { width: 170, height: 60, alignSelf: 'center', marginTop: 24, marginBottom: 32 },

  tabs: { flexDirection: 'row', marginBottom: 28, borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: DARK },
  tabText: { fontSize: 16, fontWeight: '800', color: '#8e8e93' },
  tabTextActive: { color: DARK },

  error: { color: '#c0392b', marginBottom: 12 },

  label: { fontSize: 17, fontWeight: '700', color: DARK, marginTop: 8, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#9aa0a6',
    borderRadius: 8,
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 17,
    color: DARK,
    marginBottom: 12,
  },
  pwdWrapper: { justifyContent: 'center' },
  pwdInput: { paddingRight: 46 },
  eye: { position: 'absolute', right: 14, top: 0, bottom: 12, justifyContent: 'center' },

  btn: {
    backgroundColor: DARK,
    borderRadius: 8,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 12,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 17 },

  forgot: { alignSelf: 'center', marginTop: 24 },
  forgotText: {
    fontSize: 16,
    color: DARK,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  divider: { height: 1, backgroundColor: '#bbb', marginVertical: 28 },

  footer: { textAlign: 'center', fontSize: 16, color: '#555' },
  footerLink: { color: RED, fontWeight: '800' },
});