const { getLikesHubService } = require("../services/likesHub.service");

async function getLikesHub(req, res) {
  try {
    res.json(await getLikesHubService({ id_user: req.id_user }));
  } catch (error) {
    console.error('Erreur getLikesHub:', error.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des likes' });
  }
}

module.exports = { getLikesHub };