const axios = require('axios');
const crypto = require('crypto');

const WEBDAV_URL = process.env.WEBDAV_URL; // ex: https://webdav.leevia.com/ton-espace
const RETRYABLE = ['get', 'propfind', 'head'];

const webdavClient = axios.create({
  baseURL: WEBDAV_URL, // ✅ manquait
  auth: {
    username: process.env.WEBDAV_USERNAME,
    password: process.env.WEBDAV_TOKEN
  },
  timeout: 10000
});


webdavClient.interceptors.response.use(undefined, async (error) => {
  const cfg = error.config;
  const method = cfg?.method?.toLowerCase();
  if (error.response?.status !== 429 || !cfg || !RETRYABLE.includes(method)) throw error;

  cfg.__retry = (cfg.__retry || 0) + 1;
  if (cfg.__retry > 3) throw error;

  const retryAfter = Number(error.response.headers?.['retry-after']);
  const delay = retryAfter ? retryAfter * 1000 : 500 * 2 ** cfg.__retry;
  await new Promise(r => setTimeout(r, delay));
  return webdavClient.request(cfg);
});


// Méthode MKCOL pour créer un dossier en WebDAV
webdavClient.createDirectory = async (dirPath) => {
  const parts = dirPath.replace(/\/$/, '').split('/');
  let current = '';

  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    try {
      await webdavClient.request({ method: 'MKCOL', url: `${current}/` });
    } catch (e) {
      const status = e.response?.status;
      if (status === 405 || status === 409) continue; // ✅ existe déjà = ok
      throw e; // autre erreur = on remonte
    }
  }
};

const userImageUrl = (filename) => {
  if (filename.includes('temp/')) return filename
  return `app/users/${filename}`; // relatif, baseURL fait le reste
}

function validateFilename(filename) {
  if (!filename || filename.includes('..') || (filename.includes('/') && !filename.includes('temp/'))) {
    throw new Error('Nom de fichier invalide');
  }
}

function generateUniqueId() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = {
  webdavClient, userImageUrl, validateFilename, generateUniqueId, WEBDAV_URL
};