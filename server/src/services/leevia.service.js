const { validateFilename, userImageUrl, webdavClient, generateUniqueId } = require('../utils/leevia.utils');
const path = require('path');
const sharp = require('sharp');

async function getImageRaw(filename) {
  validateFilename(filename);
  const response = await webdavClient.get(userImageUrl(filename), { responseType: 'arraybuffer' });
  return {
    data: response.data,
    contentType: response.headers['content-type'] || 'image/jpeg'
  };
}

async function getImageAsBase64(filename) {
  const { data, contentType } = await getImageRaw(filename);
  return `data:${contentType};base64,${Buffer.from(data).toString('base64')}`;
}

async function uploadOneImg(file) {
  if (!file) throw new Error('Aucun fichier fourni');
  const metadata = await sharp(file.buffer).metadata();
  const filename = `${generateUniqueId()}${path.extname(file.originalname)}`;
  await webdavClient.put(userImageUrl(filename), file.buffer, {
    headers: { 'Content-Type': file.mimetype },
    timeout: 30000  // override le timeout par défaut pour l'upload
  });
  return {
    success: true, filename, width: metadata.width, height: metadata.height, 
    ratio: metadata.width / metadata.height
  };
}


module.exports = {
  getImageAsBase64, uploadOneImg, getImageRaw
}