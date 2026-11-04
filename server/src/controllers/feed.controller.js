const { getTeamsFeed } = require("../models/feed.model");
const { getWMgender } = require("../models/users.model");

async function getFeed(req, res) {
  try {
    const id_competition = Number(req.params.id_competition);
    if (!Number.isInteger(id_competition) || id_competition <= 0) {
      return res.status(400).json({ error: 'Requête invalide' });
    }
    const gender = await getWMgender({ id_user: req.id_user });
    if (!gender) return res.status(403).json({ error: 'Profil WODMatch incomplet' });

    const result = await getTeamsFeed({ id_user: req.id_user, id_competition, gender });
    res.status(200).send(result);
  } catch (error) {
    console.log('[getFeed]', error.message);
    res.status(error.status || 500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { getFeed };