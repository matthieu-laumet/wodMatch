import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export const MINPRICE = 0;
export const MAXPRICE = 500;

export type FilterState = {
  minPrice: number;
  maxPrice: number;
  departements: string[];
  slugs: string[]; // modes + tags sélectionnés
};

const DEFAULT_FILTERS: FilterState = { minPrice: MINPRICE, maxPrice: MAXPRICE, departements: [], slugs: [] };

type FiltersContextType = {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  toggleQuickFilter: (slug: string) => void;
  resetFilters: () => void;
};

const FiltersContext = createContext<FiltersContextType>(null!);
export const useFilters = () => useContext(FiltersContext);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // un seul filtre rapide actif, re-clic = désactivé
  const toggleQuickFilter = useCallback((slug: string) => {
    setFilters(prev => ({
      ...DEFAULT_FILTERS,
      slugs: prev.slugs.length === 1 && prev.slugs[0] === slug ? [] : [slug],
    }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const value = useMemo(
    () => ({ filters, setFilters, toggleQuickFilter, resetFilters }),
    [filters, toggleQuickFilter, resetFilters],
  );
  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}