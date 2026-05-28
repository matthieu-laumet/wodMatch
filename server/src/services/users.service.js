const { upsertUserFunReps } = require('../models/funReps.model');
const { upsertUserLevel } = require('../models/levels.model');
const { upsertUserSearchMode } = require('../models/searchModes.model');
const { upsertUserSkill } = require('../models/skills.model');
const { upsertUserBio } = require('../models/users.model');


async function onboardingUserService({ id_user, levelIds, userBio, userFunReps, skillIds, userSearchMode }) {
  await Promise.all([
    upsertUserSearchMode({ id_user, id_search_mode: userSearchMode }),
    upsertUserBio({ id_user, bio: userBio }),
  ]);

  await Promise.all(skillIds.map((id_skill) => upsertUserSkill({ id_user, id_skill })));
  await Promise.all(levelIds.map((id_level) => upsertUserLevel({ id_user, id_level })));
  await Promise.all(userFunReps.map((rep) => upsertUserFunReps({ id_user, id_fun_rep: rep.id_fun_rep, description: rep.description })));

  return { message: 'ok' };
}


module.exports = {
  onboardingUserService
}