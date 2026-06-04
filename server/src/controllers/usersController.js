const { getWMUserById } = require("../models/users.model");
const { onboardingUserService, updateUserProlfilService, updateUserService } = require("../services/users.service");


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
    const { levels, userBio, userFunReps, skills, userSearchMode } = req.body;
    const result = await onboardingUserService({ id_user, levels, userBio, userFunReps, skills, userSearchMode });
    res.status(200).send(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function updateUserProlfil(req, res) {
  try {
    const id_user = req.id_user;
    const { bio, levels } = req.body;
    const result = await updateUserProlfilService({ id_user, bio, levels });
    res.status(200).send(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function updateUserEmail(req, res) {
  try {
    const id_user = req.id_user;
    const { email } = req.body;
    const result = await updateUserService({ id_user, type: 'e-mail', payload: { email }});
    res.status(200).send(result);
  } catch (error) {
    console.log('[updateUserEmail]', error.message)
    res.status(error.status || 500).json({ error: 'Erreur serveur' });
  }
}

async function updateUserTelephone(req, res) {
  try {
    const id_user = req.id_user;
    const { telephone } = req.body;
    const result = await updateUserService({ id_user, type: 'téléphone', payload: { telephone } });
    res.status(200).send(result);
  } catch (error) {
    console.log('[updateUserTelephone]', error.message)
    res.status(error.status || 500).json({ error: 'Erreur serveur' });
  }
}

module.exports = {
  onboardingUser, getCurrentWMUser, updateUserProlfil, updateUserEmail, updateUserTelephone
}