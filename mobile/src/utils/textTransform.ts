export const capitalizeString = (str?: string) =>
  str?.split(' ').map(w => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase()).join(' ') ?? '';

export function cleanSearch(input?: string) {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[-_\s]/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function liaisonVille(ville?: string) {
  if (!ville) return '';
  const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
  return vowels.includes(ville[0].toLowerCase())
    ? `d'${capitalizeString(ville)}`
    : `de ${capitalizeString(ville)}`;
}