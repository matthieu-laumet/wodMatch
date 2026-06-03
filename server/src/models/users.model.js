const pool = require('../../db/db_config');
const { format } = require('date-fns');
const { fr } = require('date-fns/locale');
const dateOptions = { locale: fr, timeZone: 'Europe/Berlin' }

async function getWMUserById({ id_user }) {
  const results = await pool().query(`
    SELECT wmu.bio, has_seen_wodmatch_welcome, usm.id_search_mode,
      ( SELECT json_agg(jsonb_build_object('id_fun_rep', ufr.id_fun_rep, 'description', ufr.description, 'label', fr.label))
        FROM wodmatch.user_fun_reps ufr
        JOIN wodmatch.fun_reps fr ON fr.id_fun_rep = ufr.id_fun_rep
        WHERE ufr.id_user = wmu.id_user
      ) AS user_fun_reps,
      ( SELECT json_agg(jsonb_build_object('id_level', ulv.id_level, 'icon', lv.icon, 'label', lv.label))
        FROM wodmatch.user_levels ulv
        JOIN wodmatch.levels lv ON lv.id_level = ulv.id_level
        WHERE ulv.id_user = wmu.id_user
      ) AS user_levels,
      ( SELECT json_agg(jsonb_build_object('id_skill', usk.id_skill, 'label', sk.label) ORDER BY usk.id_skill)
        FROM wodmatch.user_skills usk
        JOIN wodmatch.skills sk ON sk.id_skill = usk.id_skill
        WHERE usk.id_user = wmu.id_user
      ) AS user_skills
    FROM wodmatch.wm_users wmu
    JOIN wodmatch.user_search_modes usm ON usm.id_user = wmu.id_user
    WHERE wmu.id_user=$1
  ;`, [id_user]);
  return results.rows[0];
}

async function upsertUserBio({ id_user, bio }) {
  const results = await pool().query(`
    INSERT INTO wodmatch.wm_users (id_user, bio, created_at, updated_at)
    VALUES ($1, $2, NOW(), NOW())
    ON CONFLICT (id_user) DO UPDATE 
      SET bio = EXCLUDED.bio, updated_at = NOW()
      WHERE wm_users.bio IS DISTINCT FROM EXCLUDED.bio
  ;`, [id_user, bio]);
  return results.rows;
}

async function updateSeenWelcomeUser({ has_seen_wodmatch_welcome, id_user }) {
  const results = await pool().query(`
    UPDATE wodmatch.wm_users SET has_seen_wodmatch_welcome=$1 WHERE id_user=$2
  `, [has_seen_wodmatch_welcome, id_user]);
  return results.rows;
}

async function getUserInfo({ id_user }) {
  const result = await pool({ bdd: 'WODZONE' }).query(
    `SELECT email, telephone FROM wodzone.users WHERE id=$1;`,
    [id_user]
  );
  if (result.rows.length === 0) throw Object.assign(new Error('User non trouvé...'), { status: 409 });
  return result.rows[0];
}

async function updateOneUserEmail({ email, id_user }) {
  const updated_at = new Date(format(new Date(), 'yyyy-MM-dd HH:mm:ss', dateOptions));
  const result = await pool({ bdd: 'WODZONE' }).query(
    `UPDATE wodzone.users SET email=$1, updated_at=$2 WHERE id=$3 RETURNING email;`,
    [email, updated_at, id_user]
  );
  return result.rows[0];
}

async function updateOneUserTelephone({ telephone, id_user }) {
  const updated_at = new Date(format(new Date(), 'yyyy-MM-dd HH:mm:ss', dateOptions));
  const result = await pool({ bdd: 'WODZONE' }).query(
    `UPDATE wodzone.users SET telephone=$1, updated_at=$2 WHERE id=$3 RETURNING telephone;`,
    [telephone, updated_at, id_user]
  );
  return result.rows[0];
}

module.exports = {
  upsertUserBio, getWMUserById, updateSeenWelcomeUser, updateOneUserEmail, updateOneUserTelephone,
  getUserInfo
  // upsertUserLevel, deleteAllUserLevels
}