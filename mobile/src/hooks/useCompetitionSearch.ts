import { useEffect, useMemo, useState } from 'react';
import type { Competition } from '../types/competition';
import { cleanSearch } from '../utils/textTransform';
import { findNearbyCompetitions } from '../utils/competitionSearch';

const CITY_LIKE = /^[a-zA-ZÀ-ÿ\s-]+$/;

export function useCompetitionSearch(competitions: Competition[], search: string) {
  const query = search.trim();
  const [geoResults, setGeoResults] = useState<Competition[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Recherche texte (synchrone)
  const textResults = useMemo(() => {
    if (!query) return competitions;
    const q = cleanSearch(query).toLowerCase();
    const has = (s?: string) => cleanSearch(s).toLowerCase().includes(q);
    return competitions.filter(
      c => has(c.compet_name ?? c.name) || has(c.location) || c.event_mode?.some(m => has(m.mode)),
    );
  }, [competitions, query]);

  // Recherche géographique (debounce 400ms)
  useEffect(() => {
    if (!query || !CITY_LIKE.test(query)) {
      setGeoResults([]);
      setIsSearching(false);
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    const t = setTimeout(async () => {
      const res = await findNearbyCompetitions(competitions, query, 15);
      if (!cancelled) {
        setGeoResults(res);
        setIsSearching(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [competitions, query]);

  const results = useMemo(() => {
    if (!query || !geoResults.length) return textResults;
    const geoById = new Map(geoResults.map(g => [g.id_competition, g]));
    const textIds = new Set(textResults.map(t => t.id_competition));
    return [
      ...textResults.map(t => geoById.get(t.id_competition) ?? t),
      ...geoResults.filter(g => !textIds.has(g.id_competition)),
    ].sort((a, b) => new Date(a.begin).getTime() - new Date(b.begin).getTime());
  }, [query, textResults, geoResults]);

  return { results, isSearching };
}