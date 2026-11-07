const pool = require('../../db/db_config');
const zone = () => pool({ bdd: 'WODZONE' });

async function getZoneUsersByIds(ids) {
  const { rows } = await zone().query(
    'SELECT id, INITCAP(first_name) AS first_name FROM wodzone.users WHERE id = ANY($1::int[])',
    [ids]);
  return rows;
}

async function getZoneCompetitionsByIds(ids) {
  const { rows } = await zone().query(`
    SELECT id_competition, name, compet_ville AS city,
           to_char("begin", 'YYYY-MM-DD HH24:MI:SS') AS begin,
           to_char("end", 'YYYY-MM-DD HH24:MI:SS') AS "end"
    FROM wodzone.competitions
    WHERE id_competition = ANY($1::int[])`, [ids]);
  return rows;
}

async function getZoneDivisionsByIds(ids) {
  const { rows } = await zone().query(
    'SELECT id_division, name FROM wodzone.divisions WHERE id_division = ANY($1::int[])',
    [ids]);
  return rows;
}

module.exports = { getZoneUsersByIds, getZoneCompetitionsByIds, getZoneDivisionsByIds };