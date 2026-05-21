const axios = require('axios');
const crypto = require('crypto');

const WEBDAV_URL = process.env.WEBDAV_URL; // ex: https://webdav.leevia.com/ton-espace

const webdavClient = axios.create({
  baseURL: WEBDAV_URL, // ✅ manquait
  auth: {
    username: process.env.WEBDAV_USERNAME,
    password: process.env.WEBDAV_TOKEN
  },
  timeout: 10000
});

// ✅ Méthode MKCOL pour créer un dossier en WebDAV
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
  webdavClient, userImageUrl, validateFilename, generateUniqueId
};