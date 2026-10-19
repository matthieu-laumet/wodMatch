import { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { secureEmail } from '../../utils/secureEmail';

const API = process.env.EXPO_PUBLIC_API_URL;
const RED = '#cc0000';
const DARK = '#222';

export default function ForgotPassword() {
  const router = useRouter();
  const { user } = useAuth();

  const [email, setEmail] = useState(user?.email ?? '');
  const [flashError, setFlashError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) return;

    setFlashError('');
    setInfoMessage('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/emails/forgot-pwd`, { // ← à adapter (route de ton useSendMailForgotPwdMutation)
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client': 'mobile' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.message || 'Erreur serveur');

      if (data.isUser) {
        setInfoMessage(
          `Un lien pour réinitialiser votre mot de passe a été envoyé par e-mail à ${secureEmail(cleanEmail)}`
        );
      } else {
        setFlashError("Aucun compte n'existe pour l'adresse e-mail demandée.");
      }
    } catch (e: any) {
      setFlashError(e.message || 'Une erreur est survenue, réessayez plus tard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />

      {/* Header / retour */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={DARK} />
        </Pressable>
        <Text style={styles.headerTitle}>Mot de passe oublié ?</Text>
        <View style={styles.back} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {!!infoMessage && (
            <View style={styles.infoBox}>
              <Ionicons name="checkmark-circle" size={20} color="#1e7e34" />
              <Text style={styles.infoText}>{infoMessage}</Text>
            </View>
          )}

          <Text style={styles.description}>
            Saisissez l'adresse e-mail associée à votre compte. Nous vous enverrons un lien par
            e-mail pour réinitialiser votre mot de passe.
          </Text>

          <Text style={styles.label}>Adresse e-mail</Text>
          <TextInput
            style={[styles.input, !!flashError && styles.inputError]}
            value={email}
            onChangeText={(t) => { setEmail(t); setFlashError(''); }}
            placeholder="Adresse e-mail"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
          />
          {!!flashError && (
            <View style={styles.errorRow}>
              <Ionicons name="information-circle-outline" size={18} color={RED} />
              <Text style={styles.errorText}>{flashError}</Text>
            </View>
          )}

          <Pressable
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Envoyer le lien de réinitialisation</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  back: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: DARK },

  content: { padding: 16, paddingBottom: 40 },

  infoBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: '#e6f4ea',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  infoText: { flex: 1, fontSize: 15, color: '#1e4620' },

  description: { fontSize: 16, color: '#555', lineHeight: 22, marginTop: 8, marginBottom: 16 },

  label: { fontSize: 17, fontWeight: '700', color: DARK, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#9aa0a6',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 17,
    color: DARK,
  },
  inputError: { borderColor: RED },

  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  errorText: { flex: 1, color: RED, fontSize: 14 },

  btn: {
    backgroundColor: DARK,
    borderRadius: 8,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 24,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});