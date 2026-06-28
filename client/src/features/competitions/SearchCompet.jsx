// SearchCompet.jsx
import { useContext, useEffect, useRef, useState } from "react";
import dataApplicationsContext from "../../context/dataApplicationsContext";
import debounce from 'lodash/debounce';
import { cleanSearch } from "../../components/textTransform";
import { findNearbyCompetitions } from "../../components/CompetitionSearch";

export default function SearchCompet({ competitions, setDisplayCompetitions }) {
  const { filterCompetitions } = useContext(dataApplicationsContext);

  const [searchCompet, setSearchCompet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const lastSearchCompetRef = useRef(searchCompet);

  const handleReset = () => {
    setSearchCompet('');
    setDisplayCompetitions(competitions);
  };

  useEffect(() => {
    if (!competitions.length) return;

    const delay = lastSearchCompetRef.current !== searchCompet ? 400 : 0;
    lastSearchCompetRef.current = searchCompet;

    const performSearch = debounce(async () => {
      // Recherche vide → on remet toutes les compétitions
      if (!searchCompet.trim()) {
        setDisplayCompetitions(competitions);
        return;
      }

      const lowerSearch = cleanSearch(searchCompet).toLowerCase();
      const includesSearch = (str) => str?.toLowerCase().includes(lowerSearch);

      const textResults = competitions.filter((compet) => {
        const eventModes = compet.event_mode.map((mode) => mode.mode);
        return (
          includesSearch(cleanSearch(compet.compet_name)) ||
          includesSearch(compet.location) ||
          eventModes.some((mode) => includesSearch(mode))
        );
      });

      // Recherche géographique si la valeur ressemble à un nom de ville
      if (/^[a-zA-Z\s-]+$/.test(searchCompet)) {
        setIsLoading(true);
        try {
          const geoResults = await findNearbyCompetitions(competitions, searchCompet, 15);
          const existingIds = new Set(textResults.map((item) => item.id_competition));
          const geoResultsMap = new Map(geoResults.map(g => [g.id_competition, g]));
          const allResults = [
            ...textResults.map(t => geoResultsMap.get(t.id_competition) ?? t),
            ...geoResults.filter(geo => !existingIds.has(geo.id_competition)),
          ];
          setDisplayCompetitions(
            allResults.sort((a, b) => new Date(a.begin) - new Date(b.begin))
          );
        } catch (error) {
          console.error('Erreur recherche géographique:', error);
          setDisplayCompetitions(textResults);
        } finally {
          setIsLoading(false);
        }
      } else {
        setDisplayCompetitions(textResults);
      }
    }, delay);

    performSearch();
    return () => performSearch.cancel();
  }, [competitions, searchCompet, filterCompetitions]);

  return (
    <div className="flex justify-between mt-5 items-baseline gap-8">
      <div className="relative grow">
        <i className="bi bi-search search-icon" />
        {searchCompet.length > 0 && (
          <i className="bi bi-x-lg search-icon close" onClick={handleReset} />
        )}
        <input
          autoComplete="off"
          type="text"
          className="search-bar-compet"
          placeholder="Rechercher une compet"
          value={searchCompet}
          onChange={(e) => setSearchCompet(e.target.value)}
        />
        {isLoading && (
          <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            ...
          </span>
        )}
      </div>
      <i className="bi bi-sliders text-2xl cursor-pointer" />
    </div>
  );
}