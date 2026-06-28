const { getAllSearchModes, upsertUserSearchMode } = require("../models/searchModes.model");


async function getSearchModes(req, res) {
  try {
    const result = await getAllSearchModes();
    res.status(200).send(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function handleUserSearchMode(req, res) {
  try {
    const { id_search_mode } = req.body;
    const id_user = req.id_user;
    const result = await upsertUserSearchMode({ id_user, id_search_mode });
    res.status(200).json(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = {
  getSearchModes, handleUserSearchMode
}