const { getAllWodzoneCompetitions } = require("../models/competitions.model");


async function getWZCompetitions(req, res) {
  try {
    const result = await getAllWodzoneCompetitions();
    res.status(200).send(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = {
  getWZCompetitions, 
}