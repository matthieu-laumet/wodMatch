import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OnboardingData = {
  searchMode: number | null;
  levels: any;
  bio: string;
  funReps: any;
  skills: any;
};

const STORAGE_KEY = 'onboardingData';

const empty: OnboardingData = { searchMode: null, levels: null, bio: '', funReps: null, skills: null };

type Ctx = {
  data: OnboardingData;
  set: (p: Partial<OnboardingData>) => void;
  reset: () => void;
};

const OnboardingCtx = createContext<Ctx>(null!);
export const useOnboarding = () => useContext(OnboardingCtx);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(empty);
  const [hydrated, setHydrated] = useState(false);

  // Chargement au démarrage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(s => {
        if (s) setData({ ...empty, ...JSON.parse(s) });
      })
      .catch(e => console.warn('onboarding load', e))
      .finally(() => setHydrated(true));
  }, []);

  // Sauvegarde à chaque modification (seulement après le chargement initial,
  // sinon on écraserait les données sauvegardées par les valeurs vides)
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(e =>
      console.warn('onboarding save', e),
    );
  }, [data, hydrated]);

  const set = useCallback((p: Partial<OnboardingData>) => setData(d => ({ ...d, ...p })), []);

  const reset = useCallback(() => {
    setData(empty);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo(() => ({ data, set, reset }), [data, set, reset]);

  // On attend le chargement pour ne pas afficher des valeurs vides puis les écraser
  if (!hydrated) return null;

  return <OnboardingCtx.Provider value={value}>{children}</OnboardingCtx.Provider>;
}