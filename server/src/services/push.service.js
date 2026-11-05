const { getLikePushData } = require("../models/pushTokens.model");

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

async function sendPush(messages) {
  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  });
  if (!res.ok) throw new Error(`Expo push HTTP ${res.status}`);
}

async function notifyCaptainOfLike({ id_team_to, id_user_from }) {
  const { tokens, from_first_name } = await getLikePushData({ id_team_to, id_user_from });
  if (!tokens.length) return;

  await sendPush(tokens.map(to => ({
    to,
    sound: 'default',
    title: 'Nouveau like 💪',
    body: `${from_first_name ?? 'Quelqu\u2019un'} veut rejoindre ta team !`,
    data: { type: 'like', id_team: id_team_to },
  })));
}

module.exports = { sendPush, notifyCaptainOfLike };