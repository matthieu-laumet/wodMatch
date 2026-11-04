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

module.exports = { isTeamSwipable, insertSwipe, hasTeamLikedUser, insertMatch };