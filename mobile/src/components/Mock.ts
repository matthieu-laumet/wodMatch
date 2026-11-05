import type { CompetitionSummary, JoinItem, RecruitItem } from '@/types/competition';

const inDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

// Crée une compétition de 2 jours dont begin/end sont cohérents avec startDate
const makeCompetition = (id: number, name: string, city: string, days: number): CompetitionSummary => {
  const start = inDays(days);
  return {
    id,
    name,
    city,
    startDate: start,
    begin: `${start} 06:00:00`,
    end: `${inDays(days + 1)} 19:00:00`,
  };
};

const toulouse = makeCompetition(73, 'Toulouse Throwdown', 'Toulouse', 73);
const openRace = makeCompetition(101, 'The Open Race', 'Bordeaux', 101);
const marseille = makeCompetition(136, 'Marseille Throwdown', 'Marseille', 136);

export const recruitMock: RecruitItem[] = [
  {
    competition: toulouse,
    team: {
      id: 1,
      name: 'Iron Garonne',
      division: 'Inter',
      slots: [
        { gender: 'H', filledBy: 10 },
        { gender: 'H', filledBy: 11 },
        { gender: 'F', filledBy: null },
        { gender: null, filledBy: null },
      ],
    },
    likers: [
      { id: 'u1', name: 'Camille' },
      { id: 'u2', name: 'Léa' },
      { id: 'u3', name: 'Sofia' },
    ],
    matches: [
      { id: 1, name: 'Timon & Pumba', step: 'wod_test', nextLabel: 'WOD test sam. 14' },
      { id: 2, name: 'Les 4 Fantastiques', step: 'exchange' },
    ],
  },
  {
    competition: openRace,
    team: {
      id: 2,
      name: 'Duo Bordeaux',
      division: 'RX',
      slots: [
        { gender: 'F', filledBy: 10 },
        { gender: 'H', filledBy: null },
      ],
    },
    likers: [{ id: 'u4', name: 'Mathieu' }],
    matches: [],
  },
];

export const joinMock: JoinItem[] = [
  {
    competition: toulouse,
    division: 'Inter',
    searchActive: true,
    likers: [
      { id: 't1', name: 'Timon & Pumba' },
      { id: 't2', name: 'Les 4 Fantastiques' },
      { id: 't3', name: 'Rope Climbers' },
    ],
    matches: [{ id: 3, name: 'Timon & Pumba', step: 'exchange' }],
  },
  {
    competition: openRace,
    division: 'RX',
    searchActive: true,
    likers: [{ id: 't4', name: 'Box Garonne' }],
    matches: [],
  },
  { competition: marseille, division: 'Inter', searchActive: true, likers: [], matches: [] },
];