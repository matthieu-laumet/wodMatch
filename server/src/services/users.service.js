const { upsertOneUserFunReps } = require('../models/funReps.model');
const { upsertUserLevel, getUsersLevels, deleteAllUserLevels } = require('../models/levels.model');
const { upsertUserSearchMode } = require('../models/searchModes.model');
const { upsertUserSkill } = require('../models/skills.model');
const { upsertUserBio, updateSeenWelcomeUser, updateOneUserEmail, updateOneUserTelephone, getUserInfo } = require('../models/users.model');
const { formatPhoneFR } = require('../utils/users.utils');
const { sendEmail } = require('./emailService');


async function onboardingUserService({ id_user, levels, userBio, userFunReps, skills, userSearchMode }) {
  await Promise.all([
    upsertUserSearchMode({ id_user, id_search_mode: userSearchMode }),
    upsertUserBio({ id_user, bio: userBio }),
  ]);

  await Promise.all(skills.map((skill) => upsertUserSkill({ id_user, id_skill: skill.id_skill })));
  await Promise.all(levels.map((level) => upsertUserLevel({ id_user, id_level: level.id_level })));
  userFunReps && await Promise.all(userFunReps.map((rep) => upsertOneUserFunReps({ id_user, id_fun_rep: rep.id_fun_rep, description: rep.description })));
  await updateSeenWelcomeUser({ has_seen_wodmatch_welcome: true, id_user })
  return { message: 'ok', has_seen_wodmatch_welcome: true };
}

async function updateUserProlfilService({ id_user, bio, levels }) {
  await upsertUserBio({ id_user, bio });
  const oldLevels = await getUsersLevels({ id_user });
  const oldIds = oldLevels.map(l => l.id_level).sort().join(',');
  const newIds = levels.map(l => l.id_level).sort().join(',');
  if (oldIds !== newIds) {
    await deleteAllUserLevels({ id_user });
    await Promise.all(levels.map((level) => upsertUserLevel({ id_user, id_level: level.id_level })));
  }
  return { message: 'ok' };
}

async function updateUserService({ id_user, type, payload }) {
  const user = await getUserInfo({ id_user });
  const currentEmail = user.email;
  if (type === 'e-mail') {
    const newEmail = payload.email;
    if (currentEmail.trim().toLowerCase() === newEmail.trim().toLowerCase()) return { message: 'no update' };
    await updateOneUserEmail({ email: newEmail, id_user });
    await sendEmail({ object: 'updated_info', inputUpdated: type, email: newEmail });
  }
  if (type === 'téléphone') {
    const newTelephone = payload.telephone;
    const normalizedCurrent = formatPhoneFR(user.telephone);
    const normalizedNew = formatPhoneFR(newTelephone);
    if (normalizedCurrent === normalizedNew) return { message: 'no update' };
    await updateOneUserTelephone({ telephone: normalizedNew, id_user });
  }
  await sendEmail({ object: 'updated_info', inputUpdated: type, email: currentEmail });
  return { message: 'ok' };
}


module.exports = {
  onboardingUserService, updateUserProlfilService, updateUserService
}