const { getTeamsFeed } = require("../models/feed.model");

async function getFeed(req, res) {
  try {
    const id_competition = Number(req.params.id_competition);
    if (!Number.isInteger(id_competition) || id_competition <= 0) {
      return res.status(400).json({ error: 'Requête invalide' });
    }
    const result = await getTeamsFeed({ id_user: req.id_user, id_competition });
    res.status(200).send(result);
  } catch (error) {
    console.log('[getFeed]', error.message);
    res.status(error.status || 500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { getFeed };