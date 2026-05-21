const { getAllStrengths } = require('../models/strengths.model');

async function getStrengths(req, res) {
  try {
    const result = await getAllStrengths(req.params.filename);
    res.status(200).send(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = {
  getStrengths,
}