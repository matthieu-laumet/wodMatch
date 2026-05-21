const pool = require('../../db/db_config');


async function getAllStrengths() {
  const results = await pool().query(`
    SELECT id_strength, "label", "group" FROM wodmatch.strengths
  ;`);
  return results.rows
}

module.exports = {
  getAllStrengths,
}