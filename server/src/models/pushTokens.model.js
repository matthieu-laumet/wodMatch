const pool = require("../../db/db_config");

// Un token = un appareil : si un autre compte se connecte dessus, il lui est réattribué
async function upsertPushToken({ id_user, token, platform }) {
  await pool().query(`
    INSERT INTO wodmatch.user_push_tokens (token, id_user, platform)
    VALUES ($1, $2, $3)
    ON CONFLICT (token) DO UPDATE
      SET id_user = EXCLUDED.id_user, platform = EXCLUDED.platform, updated_at = now();`,
    [token, id_user, platform]);
}

async function deletePushToken({ id_user, token }) {
  await pool().query(
    `DELETE FROM wodmatch.user_push_tokens WHERE token = $1 AND id_user = $2;`,
    [token, id_user]);
}

async function getLikePushData({ id_team_to, id_user_from }) {
  const [tokensRes, fromRes] = await Promise.all([
    pool().query(`
      SELECT upt.token
      FROM wodmatch.team_members tm
      JOIN wodmatch.user_push_tokens upt ON upt.id_user = tm.id_user
      WHERE tm.id_team = $1 AND tm.role = 'captain';`, [id_team_to]),
    pool({ bdd: 'WODZONE' }).query(
      `SELECT INITCAP(first_name) AS first_name FROM wodzone.users WHERE id = $1;`, [id_user_from]),
  ]);

  return {
    tokens: tokensRes.rows.map(r => r.token),
    from_first_name: fromRes.rows[0]?.first_name ?? null,
  };
}

module.exports = { upsertPushToken, deletePushToken, getLikePushData };