import { Searching } from "@/types/competition";

export function searchingText(searching: Searching[]) {
  return searching
    .map(s => `${s.count} athlète${s.count > 1 ? 's' : ''}${s.gender ? ` (${s.gender})` : ''}`)
    .join(' + ');
}

export function searchingLabel(searching?: Searching[]) {
  if (!searching?.length) return 'Team complète';
  return `Recherche ${searchingText(searching)}`;
}