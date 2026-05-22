const pool = require('../../db/db_config');


async function getAllFunReps() {
  const results = await pool().query(`
    SELECT id_fun_rep, "label" FROM wodmatch.fun_reps ORDER BY id_fun_rep
  ;`);
  return results.rows
}

module.exports = {
  getAllFunReps,
}