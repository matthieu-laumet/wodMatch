const pool = require('../../db/db_config');


async function getAllSkills() {
  const results = await pool().query(`
    SELECT id_skill, "label", "group" FROM wodmatch.skills
  ;`);
  return results.rows
}

async function upsertUserSkill({ db = pool(), id_user, id_skill }) {
  const result = await db.query(`
    INSERT INTO wodmatch.user_skills (id_user, id_skill)
    VALUES ($1, $2)
    ON CONFLICT (id_user, id_skill) DO NOTHING
  ;`, [id_user, id_skill]);
  return result.rowCount;
}

async function deleteAllUserSkills({ db = pool(), id_user }) {
  await db.query(`
    DELETE FROM wodmatch.user_skills WHERE id_user = $1
  `, [id_user]);
}

module.exports = {
  getAllSkills, upsertUserSkill, deleteAllUserSkills
}