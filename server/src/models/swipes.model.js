const pool = require('../../db/db_config');

const exec = (db) => db ?? pool();

async function isTeamSwipable({ id_team, id_competition, id_user }, db) {
  const { rowCount } = await exec(db).query(`
    SELECT 1 FROM wodmatch.teams t
    WHERE t.id_team = $1 AND t.id_competition = $2 AND t.status = 'open'
      AND NOT EXISTS (
        SELECT 1 FROM wodmatch.team_members tm WHERE tm.id_team = t.id_team AND tm.id_user = $3
      )
  `, [id_team, id_competition, id_user]);
  return rowCount > 0;
}

// Renvoie true si le swipe a été créé, false s'il existait déjà
async function insertSwipe({ id_competition, id_user, id_team_to, direction }, db) {
  const { rowCount } = await exec(db).query(`
    INSERT INTO wodmatch.swipes (id_competition, id_user_from, id_team_to, direction)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (id_user_from, id_team_to) WHERE id_team_to IS NOT NULL DO NOTHING
  `, [id_competition, id_user, id_team_to, direction]);
  return rowCount > 0;
}

async function hasTeamLikedUser({ id_team, id_user }, db) {
  const { rowCount } = await exec(db).query(`
    SELECT 1 FROM wodmatch.swipes
    WHERE id_team_from = $1 AND id_user_to = $2 AND direction = 'like'
  `, [id_team, id_user]);
  return rowCount > 0;
}

async function insertMatch({ id_competition, id_team, id_user, status = 'matched' }, db) {
  await exec(db).query(`
    INSERT INTO wodmatch.matches (id_competition, id_team, id_user, status)
    VALUES ($1, $2, $3, $4)
  `, [id_competition, id_team, id_user, status]);
}

// Compétitions où l'utilisateur est actif (il a swipé, a été liké, ou a un match)
async function getSearchCompetitionIds(id_user) {
  const { rows } = await pool().query(`
    SELECT id_competition FROM wodmatch.swipes WHERE id_user_from = $1
    UNION
    SELECT id_competition FROM wodmatch.swipes WHERE id_user_to = $1 AND direction = 'like'
    UNION
    SELECT id_competition FROM wodmatch.matches WHERE id_user = $1`, [id_user]);
  return rows.map(r => r.id_competition);
}

async function getSearchDivisions(id_user, compIds) {
  const { rows } = await pool().query(`
    SELECT id_competition, id_division
    FROM wodmatch.user_search_divisions
    WHERE id_user = $1 AND id_competition = ANY($2::int[])`, [id_user, compIds]);
  return rows;
}

// Users qui ont liké mes teams, sans réponse de ma part, pas encore matchés
async function getPendingLikesOnTeams(teamIds) {
  const { rows } = await pool().query(`
    SELECT s.id_team_to AS id_team, s.id_user_from AS id_user
    FROM wodmatch.swipes s
    WHERE s.id_team_to = ANY($1::int[]) AND s.direction = 'like'
      AND NOT EXISTS (SELECT 1 FROM wodmatch.swipes b
                      WHERE b.id_team_from = s.id_team_to AND b.id_user_to = s.id_user_from)
      AND NOT EXISTS (SELECT 1 FROM wodmatch.matches m
                      WHERE m.id_team = s.id_team_to AND m.id_user = s.id_user_from)
    ORDER BY s.created_at DESC`, [teamIds]);
  return rows;
}

// Teams qui m'ont liké, sans réponse de ma part, pas encore matchées
async function getPendingLikesFromTeams(id_user, compIds) {
  const { rows } = await pool().query(`
    SELECT s.id_competition, s.id_team_from AS id_team, t.name
    FROM wodmatch.swipes s
    JOIN wodmatch.teams t ON t.id_team = s.id_team_from
    WHERE s.id_user_to = $1 AND s.direction = 'like' AND s.id_competition = ANY($2::int[])
      AND NOT EXISTS (SELECT 1 FROM wodmatch.swipes b
                      WHERE b.id_user_from = $1 AND b.id_team_to = s.id_team_from)
      AND NOT EXISTS (SELECT 1 FROM wodmatch.matches m
                      WHERE m.id_team = s.id_team_from AND m.id_user = $1)
    ORDER BY s.created_at DESC`, [id_user, compIds]);
  return rows;
}

module.exports = { 
  isTeamSwipable, insertSwipe, hasTeamLikedUser, insertMatch, getSearchCompetitionIds, getSearchDivisions,
  getPendingLikesOnTeams, getPendingLikesFromTeams,
};