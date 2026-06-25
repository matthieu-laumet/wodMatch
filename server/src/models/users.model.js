const pool = require('../../db/db_config');
const { format } = require('date-fns');
const { fr } = require('date-fns/locale');
const dateOptions = { locale: fr, timeZone: 'Europe/Berlin' }

async function getWMUserById({ id_user }) {
  const results = await pool().query(`
    SELECT wmu.bio, has_seen_wodmatch_welcome, usm.id_search_mode, is_hidden, 
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

async function isEmailAlreadyUsed({ email }) {
  const result = await pool({ bdd: 'WODZONE' }).query(
    `SELECT email FROM wodzone.users WHERE lower(email)=$1;`,
    [email.toLowerCase()]
  );
  return result.rows.length > 0;
}

async function isTelephoneAlreadyUsed({ telephone }) {
  const result = await pool({ bdd: 'WODZONE' }).query(
    `SELECT telephone FROM wodzone.users WHERE telephone=$1;`,
    [telephone]
  );
  return result.rows.length > 0;
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

async function updateHideOneUserProfile({ id_user, is_hidden }) {
  const updated_at = new Date(format(new Date(), 'yyyy-MM-dd HH:mm:ss', dateOptions));
  const result = await pool().query(
    `UPDATE wodmatch.wm_users SET is_hidden=$1, updated_at=$2 WHERE id_user=$3 RETURNING is_hidden;`,
    [is_hidden, updated_at, id_user]
  );
  return result.rows[0];
}


async function getAllBlockedAthletes({ id_user }) {
  const result = await pool().query(
    `SELECT id_blocked_user_contact, id_user, id_user_blocked, contact_fullname, updated_at,
      CASE WHEN id_user_blocked IS NULL THEN blocked_email ELSE NULL END AS blocked_email
    FROM wodmatch.blocked_user_contacts WHERE id_user=$1
    ;`, [id_user]
  );
  const blockedContacts = result.rows;

  // Récupérer les id_user_blocked non null pour aller chercher leurs infos club
  const blockedUserIds = blockedContacts.map(row => row.id_user_blocked).filter(id => id !== null);
  if (blockedUserIds.length === 0) return blockedContacts;

  const clubsResult = await pool({ bdd: 'WODZONE' }).query(
    `SELECT u.id, c.name as club_name FROM wodzone.users u
    LEFT JOIN wodzone.clubs c ON c.id_club = u.id_club
    WHERE u.id = ANY($1::int[])
    ;`, [blockedUserIds]
  );

  // Map id_user -> club_name pour un lookup rapide
  const clubMap = new Map(clubsResult.rows.map(row => [row.id, row.club_name]));

  return blockedContacts.map(row => ({
    ...row,
    club_name: row.id_user_blocked ? (clubMap.get(row.id_user_blocked) ?? null) : null,
  }));
}


async function verifyVisibilityAndGetEmail({ id_user, id_user_blocked }) {
  const result = await pool({ bdd: 'WODZONE' }).query(
    `WITH viewer AS (SELECT id_club FROM wodzone.users WHERE id = $2 )
    SELECT u.email, CONCAT(INITCAP(u.first_name), ' ', UPPER(u.last_name)) AS fullname FROM wodzone.users u
    LEFT JOIN wodzone.confidentialities cf ON cf.id_user = u.id
    CROSS JOIN viewer v
    WHERE
      u.id = $1
      AND COALESCE(cf.is_not_visible, false) = false
      AND (
        u.id_club = v.id_club
        OR NOT EXISTS (SELECT 1 FROM wodzone.user_club_visibilities ucv WHERE ucv.id_user = u.id)
        OR EXISTS (
          SELECT 1 FROM wodzone.user_club_visibilities ucv 
          WHERE ucv.id_user = u.id  AND ucv.id_club = v.id_club
        )
      );`,
    [id_user_blocked, id_user]
  );
  const email = result?.rows[0]?.email;
  if (!email) throw Object.assign(new Error('Aucun email ne correspond'), { status: 401 });
  return { email, fullname: result.rows[0].fullname };
}

async function insertOneBlockedUser({ id_user, blocked_email, contact_fullname, id_user_blocked }) {
  await pool().query(
    `INSERT INTO wodmatch.blocked_user_contacts (id_user, blocked_email, contact_fullname, id_user_blocked)
    VALUES($1, $2, $3, $4)
    ON CONFLICT (id_user, blocked_email) 
    DO UPDATE SET contact_fullname = EXCLUDED.contact_fullname, updated_at = now(), id_user_blocked = EXCLUDED.id_user_blocked
    ;`, [id_user, blocked_email, contact_fullname, id_user_blocked]
  );
}

async function deleteOneBlockedUser({ id_user, blocked_email, id_user_blocked }) {
  await pool().query(
    `DELETE FROM wodmatch.blocked_user_contacts WHERE id_user=$1 AND (blocked_email=$2 OR id_user_blocked=$3)
    ;`, [id_user, blocked_email, id_user_blocked]
  );
}

async function getAllVisiblesAthleteLists({ id_user }) {
  const results = await pool({ bdd: 'WODZONE' }).query(
    `WITH base AS (
      SELECT
        u.id, INITCAP(u.first_name) as first_name, UPPER(u.last_name) as last_name, u.avatar,
        u.id_club, c.name as club_name,
        ROW_NUMBER() OVER (
          PARTITION BY LOWER(u.first_name), LOWER(u.last_name), u.birth_date ORDER BY u.last_logged DESC NULLS LAST
        ) AS rn
      FROM wodzone.users u
      LEFT JOIN wodzone.clubs c ON c.id_club = u.id_club
      LEFT JOIN wodzone.confidentialities cf ON cf.id_user = u.id
      WHERE
        COALESCE(cf.is_not_visible, false) = false
        AND id != $1
        AND (
          NOT EXISTS (SELECT 1 FROM wodzone.user_club_visibilities ucv WHERE ucv.id_user = u.id)
          OR EXISTS (
            SELECT 1 FROM wodzone.user_club_visibilities ucv 
            WHERE ucv.id_user = u.id 
            AND ucv.id_club = (SELECT id_club FROM wodzone.users WHERE id = $1)
          )
        )
      )
    SELECT id, first_name, last_name, avatar, id_club, club_name
    FROM base WHERE rn = 1 ORDER BY last_name, first_name;
    `, [id_user]
  );
  return results.rows;
}

module.exports = {
  upsertUserBio, getWMUserById, updateSeenWelcomeUser, updateOneUserEmail, updateOneUserTelephone,
  getUserInfo, isEmailAlreadyUsed, isTelephoneAlreadyUsed, updateHideOneUserProfile,
  getAllBlockedAthletes, insertOneBlockedUser, deleteOneBlockedUser, getAllVisiblesAthleteLists,
  verifyVisibilityAndGetEmail
  // upsertUserLevel, deleteAllUserLevels
}