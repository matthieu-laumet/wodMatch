const pool = require('../../db/db_config');


async function getAllFunReps() {
  const results = await pool().query(`
    SELECT id_fun_rep, "label" FROM wodmatch.fun_reps ORDER BY id_fun_rep
  ;`);
  return results.rows
}

async function upsertUserFunReps({ id_user, id_fun_rep, description }) {
  const result = await pool().query(`
    INSERT INTO wodmatch.user_fun_reps (id_user, id_fun_rep, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (id_user, id_fun_rep) DO UPDATE SET description = EXCLUDED.description
  ;`, [id_user, id_fun_rep, description]);
  return result.rowCount;
}

module.exports = {
  getAllFunReps, upsertUserFunReps
}