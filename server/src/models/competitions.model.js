const pool = require('../../db/db_config');


async function getAllWodzoneCompetitions() {
  const results = await pool({ bdd: 'WODZONE' }).query(`
    SELECT 
      c.id_competition, c."name", c.begin, c.end, img_small, "location", departement, 
      jsonb_agg(DISTINCT
        jsonb_build_object(
          'lat', latitude::numeric, 'lon', longitude::numeric
        )
      ) as coordinates,
      id_club, is_competition_interne, id_statut_inscription, 
      compet_adresse, compet_code_postal, compet_ville,
      json_agg(
        json_build_object(
          'id_division', d.id_division, 'name', d.name, 'price', d.price, 'total_spot', d.total_spot,
          'sold_spots', d.sold_spots
        )
      ) as divisions,
      (SELECT jsonb_agg(jsonb_build_object(
          'tag_slug', tag.tag_slug, 'tag_name', tag.tag_name, 'tag_img', tag.tag_img, 'id_tag', tag.id_tag, 'tag_order', tag.tag_order, 
          'tag_group_order', tg.tag_group_order, 'id_event_mode', tag.id_event_mode, 'concatenated_order', LPAD(tg.tag_group_order::text, 2, '0') 
          || LPAD(tag.tag_order::text, 2, '0')
        ) ORDER BY tg.tag_group_order, tag.tag_order) 
        FROM wodzone.compet_tags ctag 
        JOIN wodzone.tags tag ON ctag.id_tag = tag.id_tag 
        JOIN wodzone.tag_groups tg ON tg.id_tag_group = tag.id_tag_group WHERE ctag.id_competition = c.id_competition
      ) as tags, 
      jsonb_agg(DISTINCT jsonb_build_object(
        'mode', INITCAP(em.event_mode_name), 'id_event_mode', em.id_event_mode, 'order', em.event_order, 'event_mode_slug', em.event_mode_slug)
      ) FILTER (WHERE em.id_event_mode IS NOT NULL) AS event_mode
    FROM wodzone.competitions c 
    LEFT JOIN wodzone.divisions d on d.id_competition = c.id_competition and d.can_register is true
    LEFT JOIN wodzone.compet_event_modes cem ON cem.id_competition = c.id_competition
    LEFT JOIN wodzone.event_modes em ON cem.id_event_mode = em.id_event_mode
    WHERE c.id_statut_inscription != 3 and c.is_published is true and c.begin > now()
    GROUP BY 
      c.id_competition, c."name", c.begin, c.end, img_small, "location", departement,
      id_club, is_competition_interne, id_statut_inscription,
      compet_adresse, compet_code_postal, compet_ville
    order by begin, c.name;
  ;`);
  return results.rows
}

module.exports = {
  getAllWodzoneCompetitions
}