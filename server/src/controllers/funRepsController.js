const { getAllFunReps } = require('../models/funReps.model');
const { upsertUserFunRepsService } = require('../services/funReps.service');

async function getFunReps(req, res) {
  try {
    const result = await getAllFunReps();
    res.status(200).send(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function upsertUserFunReps(req, res) {
  try {
    const id_user = req.id_user;
    const { oldRepId, newFunRep } = req.body;
    const result = await upsertUserFunRepsService({ id_user, oldRepId, newFunRep });
    res.status(200).send(result);
  } catch (error) {
    console.log('[upsertUserFunReps]', error.message)
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = {
  getFunReps, upsertUserFunReps
}