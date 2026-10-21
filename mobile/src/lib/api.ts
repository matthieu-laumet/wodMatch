import { useAuth } from '../context/AuthContext';

const WODZONE = process.env.EXPO_PUBLIC_WODZONE_URL;
const WODMATCH = process.env.EXPO_PUBLIC_WODMATCH_URL;
const API_KEY = process.env.EXPO_PUBLIC_MOBILE_API_KEY;

function useApi(base: string) {
  const { getAccessToken, refresh } = useAuth();

  return async (path: string, init: RequestInit = {}) => {
    const isForm = init.body instanceof FormData;
    const call = (token: string | null) =>
      fetch(`${base}${path}`, {
        ...init,
        headers: {
          'x-client': 'mobile',
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init.body && !isForm ? { 'Content-Type': 'application/json' } : {}),
          ...init.headers,
        },
      });

    let res = await call(getAccessToken());
    if (res.status === 401 || res.status === 403) {
      const fresh = await refresh();
      if (fresh) res = await call(fresh);
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const err: any = new Error(data?.error || data?.message || `Erreur ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return data;
  };
}

export const useWodzoneApi = () => useApi(`${WODZONE}/api`);
export const useWodmatchApi = () => useApi(`${WODMATCH}/api`);