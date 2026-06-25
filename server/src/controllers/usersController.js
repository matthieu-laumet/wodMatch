const { getWMUserById, updateHideOneUserProfile, getAllBlockedAthletes, insertOneBlockedUser, deleteOneBlockedUser, getAllVisiblesAthleteLists, verifyVisibilityAndGetEmail } = require("../models/users.model");
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

async function handleHideUserProfil(req, res) {
  try {
    const id_user = req.id_user;
    const { is_hidden } = req.body;
    const result = await updateHideOneUserProfile({ id_user, is_hidden });
    res.status(200).send(result);
  } catch (error) {
    console.log('[handleHideUserProfil]', error.message)
    res.status(error.status || 500).json({ error: 'Erreur serveur' });
  }
}

async function getBlockedAthlets(req, res) {
  try {
    const id_user = req.id_user;
    const result = await getAllBlockedAthletes({ id_user });
    res.status(200).send(result);
  } catch (error) {
    console.log('[getBlockedAthlets]', error.message)
    res.status(error.status || 500).json({ error: 'Erreur serveur' });
  }
}

async function addBlockedUser(req, res) {
  try {
    const id_user = req.id_user;
    const { blocked_email, contact_fullname, id_user_blocked } = req.body;

    const { email, fullname } = id_user_blocked
      ? await verifyVisibilityAndGetEmail({ id_user, id_user_blocked })
      : { email: blocked_email, fullname: contact_fullname };

    await insertOneBlockedUser({ id_user, blocked_email: email, contact_fullname: fullname, id_user_blocked });
    res.status(200).send({ message: 'insertion ok' });
  } catch (error) {
    console.log('[addBlockedUser]', error.message)
    res.status(error.status || 500).json({ error: error.status ? error.message : 'Erreur serveur' });
  }
}

async function deleteBlockedUser(req, res) {
  try {
    const id_user = req.id_user;
    const { id_user_blocked, blocked_email } = req.params;
    await deleteOneBlockedUser({ id_user, id_user_blocked, blocked_email });
    res.status(200).send({ message: 'insertion ok'});
  } catch (error) {
    console.log('[handleHideUserProfil]', error.message)
    res.status(error.status || 500).json({ error: 'Erreur serveur' });
  }
}

async function getVisiblesAthleteLists(req, res) {
  try {
    const id_user = req.id_user;
    const results = await getAllVisiblesAthleteLists({ id_user });
    res.status(200).send(results);
  } catch (error) {
    console.log('[getVisiblesAthleteLists]', error.message)
    res.status(error.status || 500).json({ error: 'Erreur serveur' });
  }
}

module.exports = {
  onboardingUser, getCurrentWMUser, updateUserProlfil, updateUserEmail, updateUserTelephone, handleHideUserProfil,
  getBlockedAthlets, addBlockedUser, deleteBlockedUser, getVisiblesAthleteLists
}