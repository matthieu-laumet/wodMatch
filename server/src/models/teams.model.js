const pool = require('../../db/db_config');

async function getOpenTeamsByOwner(id_user) {
  const { rows } = await pool().query(`
    SELECT t.id_team, t.name, t.id_competition, t.id_division, t.created_by,
      (SELECT json_agg(json_build_object('gender', s.gender, 'filledBy', s.filled_by) ORDER BY s.id_slot)
       FROM wodmatch.team_slots s WHERE s.id_team = t.id_team) AS slots
    FROM wodmatch.teams t
    WHERE t.created_by = $1 AND t.status = 'open'
    ORDER BY t.created_at DESC`, [id_user]);
  return rows;
}

module.exports = { getOpenTeamsByOwner };