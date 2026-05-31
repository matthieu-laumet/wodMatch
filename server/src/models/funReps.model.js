const pool = require('../../db/db_config');


async function getAllFunReps() {
  const results = await pool().query(`
    SELECT id_fun_rep, "label" FROM wodmatch.fun_reps ORDER BY id_fun_rep
  ;`);
  return results.rows
}

async function getAllUserJsonFunReps({ id_user }) {
  const result = await pool().query(`
    SELECT json_agg(jsonb_build_object('id_fun_rep', ufr.id_fun_rep, 'description', ufr.description, 'label', fr.label))
    AS user_fun_reps
    FROM wodmatch.user_fun_reps ufr
    JOIN wodmatch.fun_reps fr ON fr.id_fun_rep = ufr.id_fun_rep
    WHERE ufr.id_user = $1
  `, [id_user]);

  return result.rows[0].user_fun_reps
}

async function upsertOneUserFunReps({ id_user, id_fun_rep, description }) {
  const result = await pool().query(`
    INSERT INTO wodmatch.user_fun_reps (id_user, id_fun_rep, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (id_user, id_fun_rep) DO UPDATE SET description = EXCLUDED.description
  ;`, [id_user, id_fun_rep, description]);
  return result.rowCount;
}

async function deleteOneUserFunRep({ id_user, id_fun_rep }) {
  await pool().query(`
    DELETE FROM wodmatch.user_fun_reps WHERE id_user=$1 AND id_fun_rep=$2;
  `, [id_user, id_fun_rep]);
}

module.exports = {
  getAllFunReps, upsertOneUserFunReps, deleteOneUserFunRep, getAllUserJsonFunReps
}