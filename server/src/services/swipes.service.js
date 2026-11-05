const { isTeamSwipable, insertSwipe, hasTeamLikedUser, insertMatch } = require('../models/swipes.model');
const { withTransaction } = require('../utils/pool.utils');
const { notifyCaptainOfLike } = require('./push.service');

async function recordSwipeService({ id_user, id_competition, id_team_to, direction }) {
  const result = await withTransaction(async (db) => {
    const swipable = await isTeamSwipable({ id_team: id_team_to, id_competition, id_user }, db);
    if (!swipable) throw Object.assign(new Error('Team introuvable'), { status: 404 });

    const created = await insertSwipe({ id_competition, id_user, id_team_to, direction }, db);

    // Pas de match si c'est un pass, ou si le swipe existait déjà (double tap)
    if (direction !== 'like' || !created) return { match: false, notify: false };

    const liked = await hasTeamLikedUser({ id_team: id_team_to, id_user }, db);
    if (!liked) return { match: false, notify: true };

    await insertMatch({ id_competition, id_team: id_team_to, id_user }, db);
    return { match: true, notify: true };
  });

  // Après le commit : une erreur de push ne peut plus rien annuler
  if (result.notify) {
    notifyCaptainOfLike({ id_team_to, id_user_from: id_user }).catch(e => console.log('[push]', e.message));
  }

  return { match: result.match };
}

module.exports = { recordSwipeService };