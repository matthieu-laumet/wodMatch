const pool = require("../../db/db_config");

const groupBy = (rows, key) => {
  const m = new Map();
  for (const r of rows) {
    if (!m.has(r[key])) m.set(r[key], []);
    m.get(r[key]).push(r);
  }
  return m;
};

async function getLikesHub({ id_user }) {
  const db = pool();

  // 1) Mes teams (je recrute) + mes recherches actives (je rejoins)
  const [teamsRes, searchesRes] = await Promise.all([
    db.query(`
      SELECT t.id_team, t.name, t.id_competition, t.id_division,
        (SELECT json_agg(json_build_object('gender', s.gender, 'filledBy', s.filled_by) ORDER BY s.id_slot)
         FROM wodmatch.team_slots s WHERE s.id_team = t.id_team) AS slots
      FROM wodmatch.teams t
      WHERE t.created_by = $1 AND t.status = 'open'   -- adapte le filtre de statut si besoin
      ORDER BY t.created_at DESC;`, [id_user]),
    db.query(`
    SELECT c.id_competition,
            COALESCE(array_agg(DISTINCT usd.id_division) FILTER (WHERE usd.id_division IS NOT NULL), '{}') AS divisions
    FROM (
        SELECT id_competition FROM wodmatch.swipes WHERE id_user_from = $1
        UNION
        SELECT id_competition FROM wodmatch.swipes WHERE id_user_to = $1 AND direction = 'like'
        UNION
        SELECT id_competition FROM wodmatch.matches WHERE id_user = $1
    ) c
    LEFT JOIN wodmatch.user_search_divisions usd
            ON usd.id_user = $1 AND usd.id_competition = c.id_competition
    GROUP BY c.id_competition;`, [id_user]),
  ]);
  const teams = teamsRes.rows;
  const searches = searchesRes.rows;
  const teamIds = teams.map(t => t.id_team);
  const searchCompIds = searches.map(s => s.id_competition);

  // 2) Likes à traiter + matchs
  const [recruitLikes, recruitMatches, joinLikes, joinMatches] = await Promise.all([
    // Users qui ont liké mes teams, sans réponse de ma part, pas encore matchés
    db.query(`
      SELECT s.id_team_to AS id_team, s.id_user_from AS id_user
      FROM wodmatch.swipes s
      WHERE s.id_team_to = ANY($1::int[]) AND s.direction = 'like'
        AND NOT EXISTS (SELECT 1 FROM wodmatch.swipes b
                        WHERE b.id_team_from = s.id_team_to AND b.id_user_to = s.id_user_from)
        AND NOT EXISTS (SELECT 1 FROM wodmatch.matches m
                        WHERE m.id_team = s.id_team_to AND m.id_user = s.id_user_from)
      ORDER BY s.created_at DESC;`, [teamIds]),
    db.query(`
      SELECT id_match, id_team, id_user, status
      FROM wodmatch.matches WHERE id_team = ANY($1::int[]) ORDER BY created_at DESC;`, [teamIds]),
    // Teams qui m'ont liké, sans réponse de ma part, pas encore matchées
    db.query(`
      SELECT s.id_competition, s.id_team_from AS id_team, t.name
      FROM wodmatch.swipes s
      JOIN wodmatch.teams t ON t.id_team = s.id_team_from
      WHERE s.id_user_to = $1 AND s.direction = 'like' AND s.id_competition = ANY($2::int[])
        AND NOT EXISTS (SELECT 1 FROM wodmatch.swipes b
                        WHERE b.id_user_from = $1 AND b.id_team_to = s.id_team_from)
        AND NOT EXISTS (SELECT 1 FROM wodmatch.matches m
                        WHERE m.id_team = s.id_team_from AND m.id_user = $1)
      ORDER BY s.created_at DESC;`, [id_user, searchCompIds]),
    db.query(`
      SELECT m.id_match, m.id_competition, m.id_team, m.status, t.name
      FROM wodmatch.matches m JOIN wodmatch.teams t ON t.id_team = m.id_team
      WHERE m.id_user = $1 AND m.id_competition = ANY($2::int[])
      ORDER BY m.created_at DESC;`, [id_user, searchCompIds]),
  ]);

  // 3) Infos WODZONE : users, compétitions, divisions
  const userIds = [...new Set([...recruitLikes.rows, ...recruitMatches.rows].map(r => r.id_user))];
  const compIds = [...new Set([...teams.map(t => t.id_competition), ...searchCompIds])];
  const divIds = [...new Set([...teams.map(t => t.id_division), ...searches.flatMap(s => s.divisions)])];

  const z = pool({ bdd: 'WODZONE' });
  const [usersRes, compsRes, divsRes] = await Promise.all([
    z.query(`SELECT id, INITCAP(first_name) AS first_name, avatar
             FROM wodzone.users WHERE id = ANY($1::int[]);`, [userIds]),
    // ⚠️ adapte le nom de table / colonnes de tes compétitions
    z.query(`SELECT id_competition, name, compet_ville AS city,
                to_char("begin", 'YYYY-MM-DD HH24:MI:SS') AS begin,
                to_char("end", 'YYYY-MM-DD HH24:MI:SS') AS "end"
         FROM wodzone.competitions WHERE id_competition = ANY($1::int[]);`, [compIds]),
    z.query(`SELECT id_division, name FROM wodzone.divisions WHERE id_division = ANY($1::int[]);`, [divIds]),
  ]);
  const userMap = new Map(usersRes.rows.map(u => [u.id, u]));
  const divMap = new Map(divsRes.rows.map(d => [d.id_division, d.name]));
  const compMap = new Map(compsRes.rows.map(c => [c.id_competition, {
    id: c.id_competition, name: c.name, city: c.city,
    startDate: c.begin.slice(0, 10), begin: c.begin, end: c.end,
  }]));

  const person = (id) => ({
    id: String(id),
    name: userMap.get(id)?.first_name ?? 'Anonyme',
    avatar: userMap.get(id)?.avatar ?? null,
  });

  // 4) Assemblage (même forme que les mocks)
  const likesByTeam = groupBy(recruitLikes.rows, 'id_team');
  const matchesByTeam = groupBy(recruitMatches.rows, 'id_team');
  const recruit = teams
    .filter(t => compMap.has(t.id_competition))
    .map(t => ({
      competition: compMap.get(t.id_competition),
      team: { id: t.id_team, name: t.name, division: divMap.get(t.id_division) ?? '', slots: t.slots ?? [] },
      likers: (likesByTeam.get(t.id_team) ?? []).map(l => person(l.id_user)),
      matches: (matchesByTeam.get(t.id_team) ?? []).map(m => ({
        id: m.id_match, name: person(m.id_user).name, step: m.status,
      })),
    }));

  const likesByComp = groupBy(joinLikes.rows, 'id_competition');
  const matchesByComp = groupBy(joinMatches.rows, 'id_competition');
  const join = searches
    .filter(s => compMap.has(s.id_competition))
    .map(s => ({
      competition: compMap.get(s.id_competition),
      division: s.divisions.map(d => divMap.get(d)).filter(Boolean).join(' · '),
      searchActive: true,
      likers: (likesByComp.get(s.id_competition) ?? []).map(l => ({ id: String(l.id_team), name: l.name })),
      matches: (matchesByComp.get(s.id_competition) ?? []).map(m => ({
        id: m.id_match, name: m.name, step: m.status,
      })),
    }));

  return { recruit, join };
}

module.exports = { getLikesHub };