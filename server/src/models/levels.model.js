const pool = require('../../db/db_config');


async function getAllLevels() {
  const results = await pool().query(`
    SELECT id_level, "label", icon FROM wodmatch.levels
  ;`);
  return results.rows
}

async function getUsersLevels({ id_user }) {
  const results = await pool().query(`
    SELECT id_user, id_level FROM wodmatch.user_levels WHERE id_user=$1
  ;`, [id_user]);
  return results.rows
}

async function upsertUserLevel({ id_user, id_level }) {
  const result = await pool().query(`
    INSERT INTO wodmatch.user_levels (id_user, id_level)
    VALUES ($1, $2)
    ON CONFLICT (id_user, id_level) DO NOTHING
  ;`, [id_user, id_level]);
  return result.rowCount;
}

async function deleteAllUserLevels({ id_user }) {
  await pool().query(`
    DELETE FROM wodmatch.user_levels WHERE id_user=$1
  `, [id_user]);
}

module.exports = {
  getAllLevels, upsertUserLevel, getUsersLevels, deleteAllUserLevels
  // deleteAllUserLevels
}