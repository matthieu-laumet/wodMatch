import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const WODZONE = process.env.EXPO_PUBLIC_WODZONE_URL;
const WODMATCH = process.env.EXPO_PUBLIC_WODMATCH_URL;
const REFRESH_KEY = 'refreshToken';
const API_KEY = process.env.EXPO_PUBLIC_MOBILE_API_KEY;
const BASE_HEADERS: Record<string, string> = { 'x-client': 'mobile', ...(API_KEY ? { 'x-api-key': API_KEY } : {}), };

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
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);
  const inflight = useRef<Promise<{ accessToken: string; user: any } | null> | null>(null);

  const setToken = (t: string | null) => {
    tokenRef.current = t;
    setAccessTokenState(t);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    setToken(null);
    setUser(null);
  };

  const doRefresh = () => {
    if (!inflight.current) {
      inflight.current = (async () => {
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
            if (res.status === 401 || res.status === 403) await signOut();
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
          inflight.current = null;
        }
      })();
    }
    return inflight.current;
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