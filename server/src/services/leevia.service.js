const { webdavClient, generateUniqueId, WEBDAV_URL, validateFilename, userImageUrl } = require('../utils/leevia.utils');
const path = require('path');
const sharp = require('sharp');


async function getImageRaw(filename) {
  // Plus de validateFilename ici, ou une version qui accepte les /
  const url = filename.startsWith('app/') 
    ? `${WEBDAV_URL}/${filename}`      // chemin complet → app/competitions/1/xxx.jpg
    : `${WEBDAV_URL}/app/users/${filename}`;  // ancien format → xxx.jpg seul

  const response = await webdavClient.get(url, { responseType: 'arraybuffer' });
  return {
    data: response.data,
    contentType: response.headers['content-type'] || 'image/jpeg'
  };
}

async function getImageRawWodMatch(filename) {
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

async function uploadOneImg({ file, prefix = '', slot = null }) {
  if (!file) throw new Error('Aucun fichier fourni');

  if (prefix) {
    await webdavClient.createDirectory(prefix);
  }

  const metadata = await sharp(file.buffer).metadata();
  const uniqueName = `${generateUniqueId()}${path.extname(file.originalname)}`;
  const filename = `${prefix}${slot !== null ? `${slot}-` : ''}${uniqueName}`;
  
  await webdavClient.put(filename, file.buffer, {
    headers: { 'Content-Type': file.mimetype },
    timeout: 30000
  });
  return {
    success: true, filename, width: metadata.width, height: metadata.height,
    ratio: metadata.width / metadata.height
  };
}

async function reorderTempImagesService({ filenames, id_user }) {
  const results = await Promise.all(
    filenames.map(async (filename, newSlot) => {
      // Extraire le nom sans préfixe : "temp/userId/2-xxxx.jpg" → "xxxx.jpg"
      const basename = path.basename(filename); // "2-xxxx.jpg"
      const nameWithoutPrefix = basename.replace(/^\d+-/, ''); // "xxxx.jpg"
      const newFilename = `temp/${id_user}/${newSlot}-${nameWithoutPrefix}`;

      if (filename === newFilename) return { oldFilename: filename, newFilename };

      // Lire + réécrire sous le nouveau nom + supprimer l'ancien
      const response = await webdavClient.get(filename, { responseType: 'arraybuffer' });
      await webdavClient.put(newFilename, response.data, {
        headers: { 'Content-Type': response.headers['content-type'] },
        timeout: 30000
      });
      await webdavClient.delete(filename);

      return { oldFilename: filename, newFilename };
    })
  );

  return results
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
        const { data, contentType } = await getImageRawWodMatch(fullPath);
        const base64 = `data:${contentType};base64,${Buffer.from(data).toString('base64')}`;
        return { filename: fullPath, url: base64 };
      })
    );

    console.log(images)

    return images;
  } catch (e) {
    if (e.response?.status === 404) return [];
    throw e;
  }
}


module.exports = {
  getImageAsBase64, uploadOneImg, getImageRawWodMatch, getImageRaw, getUserTempImagesService, reorderTempImagesService
}