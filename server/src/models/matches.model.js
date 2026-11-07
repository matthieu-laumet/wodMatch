const pool = require('../../db/db_config');

async function getMatchesByTeams(teamIds) {
  const { rows } = await pool().query(`
    SELECT id_match, id_team, id_user, status
    FROM wodmatch.matches
    WHERE id_team = ANY($1::int[])
    ORDER BY created_at DESC`, [teamIds]);
  return rows;
}

async function getMatchesByUser(id_user, compIds) {
  const { rows } = await pool().query(`
    SELECT m.id_match, m.id_competition, m.id_team, m.status, t.name
    FROM wodmatch.matches m
    JOIN wodmatch.teams t ON t.id_team = m.id_team
    WHERE m.id_user = $1 AND m.id_competition = ANY($2::int[])
    ORDER BY m.created_at DESC`, [id_user, compIds]);
  return rows;
}

module.exports = { getMatchesByTeams, getMatchesByUser };