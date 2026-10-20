require('dotenv').config();
const axios = require('axios');

const crypto = require('crypto');
const t = process.env.WEBDAV_TOKEN || '';
console.log({
  user: process.env.WEBDAV_USERNAME,
  url: process.env.WEBDAV_URL,
  len: t.length,
  hash: crypto.createHash('sha256').update(t).digest('hex').slice(0, 8),
});

axios.request({
  method: 'PROPFIND',
  url: `${process.env.WEBDAV_URL}/temp/1/`,
  headers: { Depth: '1' },
  auth: { username: process.env.WEBDAV_USERNAME, password: process.env.WEBDAV_TOKEN },
})
  .then(r => console.log('OK', r.status))
  .catch(e => console.log('ERREUR', e.response?.status));