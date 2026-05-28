const pool = require('../../db/db_config');


async function getWMUserById({ id_user }) {
  const results = await pool().query(`
    SELECT wmu.bio, has_seen_wodmatch_welcome
    FROM wodmatch.wm_users wmu
    WHERE id_user=$1
  ;`, [id_user]);
  return results.rows[0];
}

async function upsertUserBio({ id_user, bio }) {
  const results = await pool().query(`
    INSERT INTO wodmatch.wm_users (id_user, bio, created_at, updated_at)
    VALUES ($1, $2, NOW(), NOW())
    ON CONFLICT (id_user) DO UPDATE SET bio = EXCLUDED.bio, updated_at = NOW()
  ;`, [id_user, bio]);
  return results.rows;
}

module.exports = {
  upsertUserBio, getWMUserById
  // upsertUserLevel, deleteAllUserLevels
}