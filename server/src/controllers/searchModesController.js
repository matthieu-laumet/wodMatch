const { getAllSearchModes } = require("../models/searchModes.model");


async function getSearchModes(req, res) {
  try {
    const result = await getAllSearchModes();
    res.status(200).send(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// async function CleanUpsertUserSearchModes(req, res) {
//   try {
//     const { searchModeIds } = req.body;
//     const id_user = req.id_user;
//     const result = await replaceUserSearchModes({ id_user, searchModeIds });
//     res.status(200).send(result);
//   } catch (error) {
//     console.log(error.message)
//     res.status(500).json({ error: 'Erreur serveur' });
//   }
// }

module.exports = {
  getSearchModes, 
  // CleanUpsertUserSearchModes
}