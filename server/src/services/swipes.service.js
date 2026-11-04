const { isTeamSwipable, insertSwipe, hasTeamLikedUser, insertMatch } = require('../models/swipes.model');
const { withTransaction } = require('../utils/pool.utils');

async function recordSwipeService({ id_user, id_competition, id_team_to, direction }) {
  return withTransaction(async (db) => {
    const swipable = await isTeamSwipable({ id_team: id_team_to, id_competition, id_user }, db);
    if (!swipable) throw Object.assign(new Error('Team introuvable'), { status: 404 });

    const created = await insertSwipe({ id_competition, id_user, id_team_to, direction }, db);

    // Pas de match si c'est un pass, ou si le swipe existait déjà (double tap)
    if (direction !== 'like' || !created) return { match: false };

    const liked = await hasTeamLikedUser({ id_team: id_team_to, id_user }, db);
    if (!liked) return { match: false };

    await insertMatch({ id_competition, id_team: id_team_to, id_user }, db);
    return { match: true };
  });
}

module.exports = { recordSwipeService };