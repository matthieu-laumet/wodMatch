const { upsertPushToken, deletePushToken } = require("../models/pushTokens.model");

const isExpoToken = t => typeof t === 'string' && /^Expo(nent)?PushToken\[.+\]$/.test(t);

async function savePushToken(req, res) {
  try {
    const { token, platform } = req.body;
    if (!isExpoToken(token)) return res.status(400).json({ error: 'Requête invalide' });

    await upsertPushToken({
      id_user: req.id_user,
      token, platform: ['ios', 'android'].includes(platform) ? platform : null,
    });
    res.sendStatus(204);
  } catch (error) {
    console.log('[savePushToken]', error.message);
    res.status(error.status || 500).json({ error: 'Erreur serveur' });
  }
}

async function removePushToken(req, res) {
  try {
    const { token } = req.body;
    if (!isExpoToken(token)) return res.status(400).json({ error: 'Requête invalide' });

    await deletePushToken({ id_user: req.id_user, token });
    res.sendStatus(204);
  } catch (error) {
    console.log('[removePushToken]', error.message);
    res.status(error.status || 500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { savePushToken, removePushToken };