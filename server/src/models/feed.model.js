const pool = require("../../db/db_config");

async function getTeamsFeed({ id_user, id_competition, gender, limit = 10 }) {
  const { rows: teams } = await pool().query(`
    SELECT t.id_team, t.name, t.id_division, t.team_size, t.bio, t.objective,
      (SELECT json_agg(json_build_object('id_user', tm.id_user, 'role', tm.role, 'birth_date', wu.birth_date::text)
                       ORDER BY tm.joined_at)
       FROM wodmatch.team_members tm JOIN wodmatch.wm_users wu ON wu.id_user = tm.id_user
       WHERE tm.id_team = t.id_team) AS members,
      (SELECT json_agg(json_build_object('gender', x.gender, 'count', x.n))
       FROM (SELECT gender, COUNT(*)::int AS n FROM wodmatch.team_slots
             WHERE id_team = t.id_team AND filled_by IS NULL GROUP BY gender) x) AS searching,
      (SELECT array_agg(sk.label ORDER BY sk.label)
       FROM wodmatch.team_skills tsk
       JOIN wodmatch.skills sk ON sk.id_skill = tsk.id_skill
       WHERE tsk.id_team = t.id_team) AS skills,
      (SELECT array_agg(sk.label ORDER BY sk.label)
       FROM wodmatch.team_objective_skills tos
       JOIN wodmatch.skills sk ON sk.id_skill = tos.id_skill
       WHERE tos.id_team = t.id_team) AS objective_skills,
      (SELECT array_agg(tp.url ORDER BY tp.url, tp.id_photo)
        FROM wodmatch.team_photos tp WHERE tp.id_team = t.id_team) AS photos,
      (SELECT json_agg(json_build_object('label', fr.label, 'description', tfr.description) ORDER BY fr.label)
      FROM wodmatch.team_fun_reps tfr
      JOIN wodmatch.fun_reps fr ON fr.id_fun_rep = tfr.id_fun_rep
      WHERE tfr.id_team = t.id_team) AS fun_reps
    FROM wodmatch.teams t
    WHERE t.id_competition = $2
      AND t.status = 'open'
      AND EXISTS (
        SELECT 1 FROM wodmatch.team_slots ts
        WHERE ts.id_team = t.id_team AND ts.filled_by IS NULL AND ts.gender = $4
      )
      AND NOT EXISTS (SELECT 1 FROM wodmatch.team_members tm WHERE tm.id_team = t.id_team AND tm.id_user = $1)
      AND NOT EXISTS (SELECT 1 FROM wodmatch.swipes s WHERE s.id_user_from = $1 AND s.id_team_to = t.id_team)
    ORDER BY t.created_at DESC
    LIMIT $3
  ;`, [id_user, id_competition, limit, gender]);
  if (teams.length === 0) return [];

  // Infos qui vivent dans WODZONE : nom, avatar, club, nom de catégorie
  const userIds = [...new Set(teams.flatMap(t => (t.members ?? []).map(m => m.id_user)))];
  const divIds = [...new Set(teams.map(t => t.id_division))];

  const [usersRes, divsRes] = await Promise.all([
    pool({ bdd: 'WODZONE' }).query(`
      SELECT u.id, INITCAP(u.first_name) AS first_name, UPPER(u.last_name) AS last_name, u.avatar, c.name AS club_name
      FROM wodzone.users u LEFT JOIN wodzone.clubs c ON c.id_club = u.id_club
      WHERE u.id = ANY($1::int[]);`, [userIds]),
    pool({ bdd: 'WODZONE' }).query(
      `SELECT id_division, name FROM wodzone.divisions WHERE id_division = ANY($1::int[]);`, [divIds]),
  ]);
  const userMap = new Map(usersRes.rows.map(r => [r.id, r]));
  const divMap = new Map(divsRes.rows.map(r => [r.id_division, r.name]));

  const ageOf = (d) => d ? Math.floor((Date.now() - new Date(d)) / (365.25 * 24 * 3600 * 1000)) : null;

  return teams.map(t => {
    const members = (t.members ?? []).map(m => {
      const u = userMap.get(m.id_user) || {};
      return { id_user: m.id_user, role: m.role, first_name: u.first_name, last_name: u.last_name,
               avatar: u.avatar, club_name: u.club_name, age: ageOf(m.birth_date) };
    });
    const ages = members.map(m => m.age).filter(a => a != null);
    return {
      type: 'team', id_team: t.id_team, name: t.name, bio: t.bio, objective: t.objective,
      division: { id_division: t.id_division, name: divMap.get(t.id_division) ?? null },
      members, searching: t.searching ?? [],
      avg_age: ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : null,
      skills: t.skills ?? [],
      objective_skills: t.objective_skills ?? [],
      photos: t.photos ?? [], fun_reps: t.fun_reps ?? [],
    };
  });
}

module.exports = { getTeamsFeed };