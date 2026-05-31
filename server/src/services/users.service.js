const { upsertOneUserFunReps } = require('../models/funReps.model');
const { upsertUserLevel } = require('../models/levels.model');
const { upsertUserSearchMode } = require('../models/searchModes.model');
const { upsertUserSkill } = require('../models/skills.model');
const { upsertUserBio, updateSeenWelcomeUser } = require('../models/users.model');


async function onboardingUserService({ id_user, levelIds, userBio, userFunReps, skills, userSearchMode }) {
  await Promise.all([
    upsertUserSearchMode({ id_user, id_search_mode: userSearchMode }),
    upsertUserBio({ id_user, bio: userBio }),
  ]);

  await Promise.all(skills.map((skill) => upsertUserSkill({ id_user, id_skill: skill.id_skill })));
  await Promise.all(levelIds.map((id_level) => upsertUserLevel({ id_user, id_level })));
  userFunReps && await Promise.all(userFunReps.map((rep) => upsertOneUserFunReps({ id_user, id_fun_rep: rep.id_fun_rep, description: rep.description })));
  await updateSeenWelcomeUser({ has_seen_wodmatch_welcome: true, id_user })
  return { message: 'ok', has_seen_wodmatch_welcome: true };
}


module.exports = {
  onboardingUserService
}