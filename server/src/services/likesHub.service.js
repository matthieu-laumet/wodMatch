const { getOpenTeamsByOwner } = require('../models/teams.model');
const {
  getSearchCompetitionIds, getSearchDivisions,
  getPendingLikesOnTeams, getPendingLikesFromTeams,
} = require('../models/swipes.model');
const { getMatchesByTeams, getMatchesByUser } = require('../models/matches.model');
const { getZoneUsersByIds, getZoneCompetitionsByIds, getZoneDivisionsByIds } = require('../models/wodzone.model');
const { getAvatarFilenamesByIds } = require('../models/users.model');

// ---------- petits utilitaires ----------
const unique = (arr) => [...new Set(arr)];

const groupBy = (rows, key) => {
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r[key])) map.set(r[key], []);
    map.get(r[key]).push(r);
  }
  return map;
};

// Le créateur est toujours membre, même sans ligne dans team_slots
function slotsWithOwner(team) {
  const slots = team.slots ?? [];
  const hasOwner = slots.some(s => String(s.filledBy) === String(team.created_by));
  return hasOwner ? slots : [{ gender: null, filledBy: team.created_by, isOwner: true }, ...slots];
}

// ---------- le service ----------
async function getLikesHubService({ id_user }) {
  // 1. Mes teams (je recrute) et mes compétitions de recherche (je rejoins)
  const [teams, searchCompIds] = await Promise.all([
    getOpenTeamsByOwner(id_user),
    getSearchCompetitionIds(id_user),
  ]);
  const teamIds = teams.map(t => t.id_team);

  // 2. Likes et matchs, des deux côtés
  const [recruitLikes, recruitMatches, joinLikes, joinMatches, searchDivisions] = await Promise.all([
    getPendingLikesOnTeams(teamIds),
    getMatchesByTeams(teamIds),
    getPendingLikesFromTeams(id_user, searchCompIds),
    getMatchesByUser(id_user, searchCompIds),
    getSearchDivisions(id_user, searchCompIds),
  ]);

  // 3. Infos complémentaires (users, compétitions, divisions, avatars)
  const userIds = unique([...recruitLikes, ...recruitMatches].map(r => r.id_user));
  const compIds = unique([...teams.map(t => t.id_competition), ...searchCompIds]);
  const divIds = unique([...teams.map(t => t.id_division), ...searchDivisions.map(d => d.id_division)]);

  const [users, comps, divs, avatars] = await Promise.all([
    getZoneUsersByIds(userIds),
    getZoneCompetitionsByIds(compIds),
    getZoneDivisionsByIds(divIds),
    getAvatarFilenamesByIds(userIds),
  ]);

  // 4. Dictionnaires de lookup
  const userName = new Map(users.map(u => [u.id, u.first_name]));
  const avatarOf = new Map(avatars.map(a => [a.id_user, a.avatar_filename]));
  const divName = new Map(divs.map(d => [d.id_division, d.name]));
  const compOf = new Map(comps.map(c => [c.id_competition, {
    id: c.id_competition, name: c.name, city: c.city,
    startDate: c.begin.slice(0, 10), begin: c.begin, end: c.end,
  }]));

  const person = (id) => ({
    id: String(id),
    name: userName.get(id) ?? 'Anonyme',
    avatarVersion: avatarOf.get(id) ?? null,
  });

  // 5. Mise en forme
  const likesByTeam = groupBy(recruitLikes, 'id_team');
  const matchesByTeam = groupBy(recruitMatches, 'id_team');
  const recruit = teams
    .filter(t => compOf.has(t.id_competition))
    .map(t => ({
      competition: compOf.get(t.id_competition),
      team: {
        id: t.id_team,
        name: t.name,
        division: divName.get(t.id_division) ?? '',
        slots: slotsWithOwner(t),
      },
      likers: (likesByTeam.get(t.id_team) ?? []).map(l => person(l.id_user)),
      matches: (matchesByTeam.get(t.id_team) ?? []).map(m => ({
        ...person(m.id_user),   // id (user), name, avatarVersion
        matchId: m.id_match,
        step: m.status,
      })),
    }));

  const likesByComp = groupBy(joinLikes, 'id_competition');
  const matchesByComp = groupBy(joinMatches, 'id_competition');
  const divisionsByComp = groupBy(searchDivisions, 'id_competition');
  const join = searchCompIds
    .filter(id => compOf.has(id))
    .map(id => ({
      competition: compOf.get(id),
      division: (divisionsByComp.get(id) ?? [])
        .map(d => divName.get(d.id_division))
        .filter(Boolean)
        .join(' · '),
      searchActive: true,
      likers: (likesByComp.get(id) ?? []).map(l => ({ id: String(l.id_team), name: l.name })),
      matches: (matchesByComp.get(id) ?? []).map(m => ({ id: m.id_match, name: m.name, step: m.status })),
    }));

  return { recruit, join };
}

module.exports = { getLikesHubService };