import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { Image } from 'expo-image';
import { useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { registerForPush } from '@/lib/push';

SplashScreen.preventAutoHideAsync();

const WODZONE = process.env.EXPO_PUBLIC_WODZONE_URL;
const WODMATCH = process.env.EXPO_PUBLIC_WODMATCH_URL;
console.log('URLS', WODZONE, WODMATCH);
const REFRESH_KEY = 'refreshToken';
const API_KEY = process.env.EXPO_PUBLIC_MOBILE_API_KEY;
const BASE_HEADERS: Record<string, string> = { 'x-client': 'mobile', ...(API_KEY ? { 'x-api-key': API_KEY } : {}), };
let inflight: Promise<{ accessToken: string; user: any } | null> | null = null;

type User = { email: string; has_seen_wodmatch_welcome?: boolean; [k: string]: any };

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  refresh: () => Promise<string | null>;
  getAccessToken: () => string | null;
};

const AuthContext = createContext<AuthContextType>(null!);
export const useAuth = () => useContext(AuthContext);

// équivalent de useLazyGetCurrentWMUserQuery
async function fetchWmUser(token: string) {
  const url = `${WODMATCH}/api/users/get-current-wm-user`;
  try {
    const res = await fetch(url, {
      headers: { ...BASE_HEADERS, Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    if (res.ok) return JSON.parse(text);
  } catch (e) {
    console.error('wm user', e);
  }
  return {};
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);
  const pushTokenRef = useRef<string | null>(null);

  const setToken = (t: string | null) => {
    tokenRef.current = t;
    setAccessTokenState(t);
  };

   // Nettoyage local uniquement
  const clearSession = async () => {
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    setToken(null);
    setUser(null);
    queryClient.clear();
    Image.clearMemoryCache();
    await Image.clearDiskCache();
  };

  // Déconnexion volontaire : on prévient le serveur, puis on nettoie
  const signOut = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);

      if (pushTokenRef.current) {
        await fetch(`${WODMATCH}/api/users/push-token`, {
          method: 'DELETE',
          signal: AbortSignal.timeout(5000),
          headers: {
            ...BASE_HEADERS,
            'Content-Type': 'application/json',
            ...(tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {}),
          },
          body: JSON.stringify({ token: pushTokenRef.current }),
        }).catch(() => {});
        pushTokenRef.current = null;
      }
      await fetch(`${WODZONE}/api/users/logout`, {
        method: 'POST',
        signal: AbortSignal.timeout(5000),
        headers: {
          ...BASE_HEADERS,
          'Content-Type': 'application/json',
          ...(tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {}),
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (e) {
      console.warn('logout serveur', e);
    } finally {
      await clearSession();
    }
  };

  const doRefresh = () => {
    if (!inflight) {
      inflight = (async () => {
      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
        if (!refreshToken) return null;
        const res = await fetch(`${WODZONE}/api/refresh`, {
          method: 'POST',
          headers: { ...BASE_HEADERS, 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        const text = await res.text();
          if (!res.ok) {
            if (res.status === 401) await clearSession();
            return null;
          }
          const data = JSON.parse(text);
          if (data.refreshToken) await SecureStore.setItemAsync(REFRESH_KEY, data.refreshToken);
          setToken(data.accessToken);
          return { accessToken: data.accessToken as string, user: data.user };
        } catch (e) {
          console.error(e);
          return null;
        } finally {
          inflight = null;
        }
      })();
    }
    return inflight;
  };

  const refresh = async () => (await doRefresh())?.accessToken ?? null;

  // au lancement (équivalent de PersistLogin)
  useEffect(() => {
    (async () => {
      try {
        const r = await doRefresh();
        if (r) {
          const wm = await fetchWmUser(r.accessToken);
          setUser({ ...r.user, ...wm });
        }
      } finally {
        setIsLoading(false);
        SplashScreen.hideAsync();
      }
    })();
  }, []);

  useEffect(() => {
    if (!user?.id_user) return; // adapte au champ id de ton user
    (async () => {
      try {
        const token = await registerForPush();
        if (!token || !tokenRef.current) return;
        pushTokenRef.current = token;
        await fetch(`${WODMATCH}/api/users/push-token`, {
          method: 'POST',
          headers: {
            ...BASE_HEADERS,
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenRef.current}`,
          },
          body: JSON.stringify({ token, platform: Platform.OS }),
        });
      } catch (e) {
        console.warn('push token', e); // ne doit jamais bloquer l'app
      }
    })();
  }, [user?.id_user]);

  const signIn = async (email: string, pwd: string) => {
    const res = await fetch(`${WODZONE}/api/users/login`, {
      method: 'POST',
      headers: { ...BASE_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase().trim(), pwd }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 429) throw new Error(data?.error || 'Trop de tentatives, réessayez plus tard.');
      if ([400, 401].includes(res.status)) throw new Error(data?.message || 'Identifiants invalides');
      throw new Error('Erreur serveur');
    }

    if (data.refreshToken) await SecureStore.setItemAsync(REFRESH_KEY, data.refreshToken);
    setToken(data.accessToken);
    const wm = await fetchWmUser(data.accessToken);
    setUser({ ...data.currentUser, ...wm });
  };

  const updateUser = (patch: Partial<User>) => setUser(u => (u ? { ...u, ...patch } : u));

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isLoading, signIn, signOut, updateUser, refresh, getAccessToken: () => tokenRef.current }}
    >
      {children}
    </AuthContext.Provider>
  );
}