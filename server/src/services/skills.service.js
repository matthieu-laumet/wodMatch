const pool = require('../../db/db_config');
const { deleteAllUserSkills, upsertUserSkill } = require('../models/skills.model');


async function replaceUserSkills({ id_user, skillIds }) {
  const client = await pool().connect();
  try {
    await client.query('BEGIN');
    
    await deleteAllUserSkills({ db: client, id_user });

    if (skillIds.length > 0) {
      await Promise.all(
        skillIds.map(async (id_skill) => {
          await upsertUserSkill({ db: client, id_user, id_skill })
        })
      );
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}


module.exports = {
  replaceUserSkills
}