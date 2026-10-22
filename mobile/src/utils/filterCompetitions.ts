import { FilterState } from '@/context/FiltersContext';
import type { Competition, EventMode, Tag } from '../types/competition';

// TODO: appliquer minPrice / maxPrice / departements (absents du code web actuel)
export function filterCompetitions(
  competitions: Competition[],
  filters: FilterState,
  modes: EventMode[],
  tags: Tag[],
) {
  const modeSlugs = new Set(modes.map(m => m.event_mode_slug));
  const tagSlugs = new Set(tags.map(t => t.tag_slug));
  const selectedModes = filters.slugs.filter(s => modeSlugs.has(s));
  const selectedTags = filters.slugs.filter(s => tagSlugs.has(s));

  if (!selectedModes.length && !selectedTags.length) return competitions;

  return competitions.filter(c => {
    const cModes = c.event_mode?.map(m => m.event_mode_slug) ?? [];
    const cTags = c.tags?.map(t => t.tag_slug) ?? [];
    return selectedModes.every(s => cModes.includes(s)) && selectedTags.every(s => cTags.includes(s));
  });
}