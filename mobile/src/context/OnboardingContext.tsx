import { createContext, useContext, useState, type ReactNode } from 'react';

type OnboardingData = {
  searchMode: number | null;
  levels: any;
  bio: string;
  funReps: any;
  skills: any;
};

const empty: OnboardingData = { searchMode: null, levels: null, bio: '', funReps: null, skills: null };

const Ctx = createContext<{ data: OnboardingData; set: (p: Partial<OnboardingData>) => void; reset: () => void }>(null!);
export const useOnboarding = () => useContext(Ctx);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(empty);
  const set = (p: Partial<OnboardingData>) => setData(d => ({ ...d, ...p }));
  const reset = () => setData(empty);
  return <Ctx.Provider value={{ data, set, reset }}>{children}</Ctx.Provider>;
}