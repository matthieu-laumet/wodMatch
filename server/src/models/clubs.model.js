const pool = require('../../db/db_config');
const { format } = require('date-fns');
const { fr } = require('date-fns/locale');
const dateOptions = { locale: fr, timeZone: 'Europe/Berlin' }


async function getAllClubsData() {
  const results = await pool().query(`SELECT id_club, "name" FROM wodzone.clubs ORDER BY "name";`);
  return results.rows
}

async function insertOneClubOnValidation({ club_name, id_user }) {
  const results = await pool().query(`
    INSERT INTO wodzone.clubs_on_validations ("club_name", "id_user") VALUES($1, $2) returning *
  ;`, [club_name, id_user]);
  return results.rows[0]
}

async function getIdClubFromUser({ id_user }) {
  const results = await pool().query(`SELECT u.id_club FROM wodzone.users u WHERE u.id = $1;`, [id_user]);
  return results.rows[0]
}

async function deleteUserClubVisibilities({ db = pool, id_user }) {
  await db.query(`DELETE FROM wodzone.user_club_visibilities WHERE id_user=$1;`, [id_user]);
}

async function insertUserClubVisibilities({ db = pool, select_box, id_user }) {
  if (!Array.isArray(select_box) || select_box.length === 0) {
    throw new Error('select_box invalide');
  }
  const clubIds = select_box.map(box => parseInt(box.value, 10));
  if (clubIds.some(isNaN)) {
    throw new Error('id_club invalide');
  }

  const updated_at = new Date(format(new Date(), 'yyyy-MM-dd HH:mm:ss', dateOptions));

  const values = clubIds.map((_, index) => {
    const clubParamIndex = 2 + index;
    const createdAtIndex = 2 + clubIds.length;
    const updatedAtIndex = 3 + clubIds.length;
    return `($1, $${clubParamIndex}, $${createdAtIndex}, $${updatedAtIndex})`;
  }).join(', ');

  await db.query(`
    INSERT INTO wodzone.user_club_visibilities (id_user, id_club, created_at, updated_at) 
    VALUES ${values}
  ;`, [id_user, ...clubIds, updated_at, updated_at]);
}

module.exports = {
  getAllClubsData, insertOneClubOnValidation, getIdClubFromUser, deleteUserClubVisibilities, insertUserClubVisibilities
}