const { getLikesHub } = require("../models/likes.model");

async function getHub(req, res) {
  try {
    const result = await getLikesHub({ id_user: req.id_user });
    res.status(200).send(result);
  } catch (error) {
    console.log('[getHub]', error.message);
    res.status(error.status || 500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { getHub };