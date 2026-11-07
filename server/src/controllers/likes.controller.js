const { getLikesHubService } = require("../services/likesHub.service");

async function getHub(req, res) {
  try {
    const result = await getLikesHubService({ id_user: req.id_user });
    res.status(200).send(result);
  } catch (error) {
    console.log('[getHub]', error.message);
    res.status(error.status || 500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { getHub };