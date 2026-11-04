const { recordSwipeService } = require("../services/swipes.service");


async function postSwipe(req, res) {
  try {
    const id_competition = Number(req.params.id_competition);
    const id_team_to = Number(req.body.id_team_to);
    const { direction } = req.body;
    if (!Number.isInteger(id_competition) || id_competition <= 0 ||
        !Number.isInteger(id_team_to) || id_team_to <= 0 ||
        !['like', 'pass'].includes(direction)) {
      return res.status(400).json({ error: 'Requête invalide' });
    }
    res.json(await recordSwipeService({ id_user: req.id_user, id_competition, id_team_to, direction }));
  } catch (error) {
    console.log('[postSwipe]', error.message);
    res.status(error.status || 500).json({ error: error.status ? error.message : 'Erreur serveur' });
  }
}

module.exports = { postSwipe };