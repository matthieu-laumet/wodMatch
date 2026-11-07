require('dotenv').config(); // même chemin que dans ton serveur, ajoute { path: '...' } si besoin
const axios = require('axios');

const { WEBDAV_URL, WEBDAV_USERNAME, WEBDAV_TOKEN } = process.env;

// 1. Les variables sont-elles chargées ?
console.log('WEBDAV_URL     :', WEBDAV_URL);
console.log('WEBDAV_USERNAME:', WEBDAV_USERNAME);
console.log('WEBDAV_TOKEN   :', WEBDAV_TOKEN ? `défini (${WEBDAV_TOKEN.length} caractères)` : 'MANQUANT');

// 2. L'utilisateur correspond-il à celui de l'URL ?
const userInUrl = WEBDAV_URL?.match(/\/files\/([^/]+)/)?.[1];
console.log('Utilisateur dans l\'URL :', userInUrl);
console.log('Identique au USERNAME   :', userInUrl === WEBDAV_USERNAME);
console.log('TOKEN brut :', JSON.stringify(WEBDAV_TOKEN));

// 3. Les identifiants sont-ils acceptés ? (un seul essai)
axios.request({
  method: 'PROPFIND',
  url: WEBDAV_URL + '/',
  headers: { Depth: '0' },
  auth: { username: WEBDAV_USERNAME, password: WEBDAV_TOKEN },
  timeout: 30000,
})
  .then(r => console.log('OK, statut', r.status))
  .catch(e => console.log('ÉCHEC, statut', e.response?.status, e.code, e.message));