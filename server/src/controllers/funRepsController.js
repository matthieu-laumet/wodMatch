const { getAllFunReps } = require('../models/funReps.model');

async function getFunReps(req, res) {
  try {
    const result = await getAllFunReps(req.params.filename);
    res.status(200).send(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = {
  getFunReps,
}