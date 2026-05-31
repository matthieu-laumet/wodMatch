const { upsertOneUserFunReps, deleteOneUserFunRep, getAllUserJsonFunReps } = require("../models/funReps.model");


async function upsertUserFunRepsService({ id_user, oldRepId, newFunRep }) {
  const isSwap = oldRepId && oldRepId !== newFunRep.id_fun_rep;
  if (isSwap) await deleteOneUserFunRep({ id_user, id_fun_rep: oldRepId });
  await upsertOneUserFunReps({ id_user, id_fun_rep: newFunRep.id_fun_rep, description: newFunRep.description });
  const user_fun_reps = await getAllUserJsonFunReps({ id_user });

  return { user_fun_reps };
}


module.exports = {
  upsertUserFunRepsService
}