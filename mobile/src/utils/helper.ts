import { Competition, PipelineStep, Slot } from "@/types/competition";

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

export const daysUntil = (iso: string) => {
  const start = new Date(iso + 'T00:00:00').getTime();
  const today = new Date().setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((start - today) / 86400000));
};

export const formatDate = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

export const subtitle = (c: Competition) => `${c.name} · ${formatDate(c.startDate)}`;

export const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

export const initials = (name: string) =>
  name.split(/[\s&]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

/** « Camille, Léa et 1 autre t'ont liké » */
export const likersSentence = (names: string[], what: 'personne' | 'team') => {
  if (names.length === 1) return `${names[0]} t'a liké`;
  const [a, b, ...rest] = names;
  const tail = rest.length ? ` et ${rest.length} autre${rest.length > 1 ? 's' : ''}` : '';
  return what === 'team' || rest.length ? `${a}, ${b}${tail} t'ont liké` : `${a} et ${b} t'ont liké`;
};

export const missingLabel = (slots: Slot[], division: string) => {
  const open = slots.filter((s) => s.filledBy === null);
  const f = open.filter((s) => s.gender === 'F').length;
  const h = open.filter((s) => s.gender === 'H').length;
  const any = open.length - f - h;
  const parts = [f && `${f} F`, h && `${h} H`, any && `${any} athlète${any > 1 ? 's' : ''}`].filter(Boolean);
  return `manque ${parts.join(' + ')} · ${division}`;
};

export const STEP_LABEL: Record<PipelineStep, string> = {
  match: 'Match', exchange: 'Échange', wod_test: 'WOD test', roster: 'Roster',
};