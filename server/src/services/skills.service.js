const pool = require('../../db/db_config');
const { deleteAllUserSkills, upsertUserSkill } = require('../models/skills.model');


async function replaceUserSkills({ id_user, skills }) {
  const client = await pool().connect();
  try {
    await client.query('BEGIN');
    
    await deleteAllUserSkills({ db: client, id_user });

    if (skills.length > 0) {
      await Promise.all(
        skills.map(async (skill) => {
          await upsertUserSkill({ db: client, id_user, id_skill: skill.id_skill })
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