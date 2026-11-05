import { JoinItem, RecruitItem } from "@/types/competition";

const inDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const toulouse = { id: 73, name: 'Toulouse Throwdown', city: 'Toulouse', startDate: inDays(73), division_name: 'Inter', begin: '2026-09-26 06:00:00', end: '2026-09-27 19:00:00' };
const openRace = { id: 101, name: 'The Open Race', city: 'Bordeaux', startDate: inDays(101), division_name: 'Inter', begin: '2026-09-26 06:00:00', end: '2026-09-27 19:00:00' };
const marseille = { id: 136, name: 'Marseille Throwdown', city: 'Marseille', startDate: inDays(136), division_name: 'Inter', begin: '2026-09-26 06:00:00', end: '2026-09-27 19:00:00' };

export const recruitMock: RecruitItem[] = [
  {
    competition: toulouse,
    team: {
      id: 1, name: 'Iron Garonne', division: 'Inter',
      slots: [
        { gender: 'H', filledBy: 10 }, { gender: 'H', filledBy: 11 },
        { gender: 'F', filledBy: null }, { gender: null, filledBy: null },
      ],
    },
    likers: [
      { id: 'u1', name: 'Camille' }, { id: 'u2', name: 'Léa' }, { id: 'u3', name: 'Sofia' },
    ],
    matches: [
      { id: 1, name: 'Timon & Pumba', step: 'wod_test', nextLabel: 'WOD test sam. 14' },
      { id: 2, name: 'Les 4 Fantastiques', step: 'exchange' },
    ],
  },
  {
    competition: openRace,
    team: {
      id: 2, name: 'Duo Bordeaux', division: 'RX',
      slots: [{ gender: 'F', filledBy: 10 }, { gender: 'H', filledBy: null }],
    },
    likers: [{ id: 'u4', name: 'Mathieu' }],
    matches: [],
  },
];

export const joinMock: JoinItem[] = [
  {
    competition: toulouse, division: 'Inter', searchActive: true,
    likers: [
      { id: 't1', name: 'Timon & Pumba' }, { id: 't2', name: 'Les 4 Fantastiques' },
      { id: 't3', name: 'Rope Climbers' },
    ],
    matches: [{ id: 3, name: 'Timon & Pumba', step: 'exchange' }],
  },
  {
    competition: openRace, division: 'RX', searchActive: true,
    likers: [{ id: 't4', name: 'Box Garonne' }],
    matches: [],
  },
  { competition: marseille, division: 'Inter', searchActive: true, likers: [], matches: [] },
];