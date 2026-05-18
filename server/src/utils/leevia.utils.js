const axios = require('axios');
const WEBDAV_URL = process.env.WEBDAV_URL;
const crypto = require('crypto');

const webdavClient = axios.create({
  auth: {
    username: process.env.WEBDAV_USERNAME,
    password: process.env.WEBDAV_TOKEN
  },
  timeout: 10000
});

const userImageUrl = (filename) => `${WEBDAV_URL}/app/users/${filename}`;

function validateFilename(filename) {
  if (!filename || filename.includes('..') || filename.includes('/')) {
    throw new Error('Nom de fichier invalide');
  }
}

function generateUniqueId() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = { 
  webdavClient, userImageUrl, validateFilename, generateUniqueId
};