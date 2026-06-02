const { getWMUserById } = require("../models/users.model");
const { onboardingUserService, updateUserProlfilService } = require("../services/users.service");


async function getCurrentWMUser(req, res) {
  try {
    const id_user = req.id_user;
    const result = await getWMUserById({ id_user });
    res.status(200).send(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function onboardingUser(req, res) {
  try {
    const id_user = req.id_user;
    const { levelIds, userBio, userFunReps, skills, userSearchMode } = req.body;
    const result = await onboardingUserService({ id_user, levelIds, userBio, userFunReps, skills, userSearchMode });
    res.status(200).send(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function updateUserProlfil(req, res) {
  try {
    const id_user = req.id_user;
    const { bio } = req.body;
    const result = await updateUserProlfilService({ id_user, bio });
    res.status(200).send(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = {
  onboardingUser, getCurrentWMUser, updateUserProlfil
}