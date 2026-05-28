const { getAllLevels } = require("../models/levels.model");


async function getLevels(req, res) {
  try {
    const result = await getAllLevels();
    res.status(200).send(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// async function CleanUpsertUserLevels(req, res) {
//   try {
//     const { levelIds } = req.body;
//     const id_user = req.id_user;
//     const result = await replaceUserLevels({ id_user, levelIds });
//     res.status(200).send(result);
//   } catch (error) {
//     console.log(error.message)
//     res.status(500).json({ error: 'Erreur serveur' });
//   }
// }

module.exports = {
  getLevels, 
  // CleanUpsertUserLevels
}