const { getAllSkills } = require('../models/skills.model');
const { replaceUserSkills } = require('../services/skills.service');

async function getSkills(req, res) {
  try {
    const result = await getAllSkills();
    res.status(200).send(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function CleanUpsertUserSkills(req, res) {
  try {
    const { skills } = req.body;
    const id_user = req.id_user;
    const result = await replaceUserSkills({ id_user, skills });
    res.status(200).send(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = {
  getSkills, CleanUpsertUserSkills
}