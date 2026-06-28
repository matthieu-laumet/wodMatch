const pool = require('../../db/db_config');


async function getAllSearchModes() {
  const results = await pool().query(`
    SELECT id_search_mode, "label", label_short, icon FROM wodmatch.search_modes
  ;`);
  return results.rows
}

async function upsertUserSearchMode({ id_user, id_search_mode }) {
  const result = await pool().query(`
    INSERT INTO wodmatch.user_search_modes (id_user, id_search_mode)
    VALUES ($1, $2)
    ON CONFLICT (id_user) DO UPDATE 
      SET id_search_mode = EXCLUDED.id_search_mode
  ;`, [id_user, id_search_mode]);
  return result.rows[0];
}

// async function upsertUserSearchMode({ id_user, id_search_mode }) {
//   const result = await pool().query(`
//     INSERT INTO wodmatch.user_search_modes (id_user, id_search_mode)
//     VALUES ($1, $2)
//     ON CONFLICT (id_user, id_search_mode) DO NOTHING
//   ;`, [id_user, id_search_mode]);
//   return result.rowCount;
// }

module.exports = {
  getAllSearchModes, upsertUserSearchMode, 
}