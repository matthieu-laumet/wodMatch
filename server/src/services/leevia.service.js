const { validateFilename, userImageUrl, webdavClient, generateUniqueId } = require('../utils/leevia.utils');
const path = require('path');
const sharp = require('sharp');


async function getImageRaw(filename) {
  validateFilename(filename);
  const response = await webdavClient.get(userImageUrl(filename), {
    responseType: 'arraybuffer'
  });
  return {
    data: response.data,
    contentType: response.headers['content-type'] || 'image/jpeg'
  };
}

async function getImageAsBase64(filename) {
  const { data, contentType } = await getImageRaw(filename);
  return `data:${contentType};base64,${Buffer.from(data).toString('base64')}`;
}

async function uploadOneImg({ file, prefix = '' }) {
  if (!file) throw new Error('Aucun fichier fourni');

  if (prefix) {
    await webdavClient.createDirectory(prefix);
  }

  const metadata = await sharp(file.buffer).metadata();
  const filename = `${prefix}${generateUniqueId()}${path.extname(file.originalname)}`;
  
  await webdavClient.put(filename, file.buffer, {
    headers: { 'Content-Type': file.mimetype },
    timeout: 30000
  });
  return {
    success: true, filename, width: metadata.width, height: metadata.height,
    ratio: metadata.width / metadata.height
  };
}



async function getUserTempImagesService(id_user) {
  const dirPath = `temp/${id_user}/`;
  
  try {
    const response = await webdavClient.request({
      method: 'PROPFIND',
      url: dirPath,
      headers: { Depth: '1' },
    });

    const matches = [...response.data.matchAll(/<d:href>([^<]+)<\/d:href>/g)];
    const filenames = matches
      .map(m => decodeURIComponent(m[1]))
      .filter(href => !href.endsWith(dirPath) && /\.(jpe?g|png|webp)$/i.test(href))
      .map(href => href.split('/').pop());

    // ✅ On fetch toutes les images en parallèle
    const images = await Promise.all(
      filenames.map(async (filename) => {
        const fullPath = `${dirPath}${filename}`;
        const { data, contentType } = await getImageRaw(fullPath);
        const base64 = `data:${contentType};base64,${Buffer.from(data).toString('base64')}`;
        return { filename: fullPath, url: base64 };
      })
    );

    return images;
  } catch (e) {
    if (e.response?.status === 404) return [];
    throw e;
  }
}


module.exports = {
  getImageAsBase64, uploadOneImg, getImageRaw, getUserTempImagesService
}