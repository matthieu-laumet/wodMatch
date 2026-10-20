const { webdavClient, generateUniqueId, WEBDAV_URL, validateFilename, userImageUrl } = require('../utils/leevia.utils');
const path = require('path');
const sharp = require('sharp');

// --- liste légère (1 seul PROPFIND, aucune image téléchargée) ---
const listCache = new Map(); // id_user -> { at, data }
const LIST_TTL = 30_000;


async function listUserTempFilenamesService(id_user) {
  const hit = listCache.get(id_user);
  if (hit && Date.now() - hit.at < LIST_TTL) return hit.data;

  const dirPath = `temp/${id_user}/`;
  let data = [];
  try {
    const response = await webdavClient.request({
      method: 'PROPFIND',
      url: dirPath,
      headers: { Depth: '1' },
    });
    const matches = [...response.data.matchAll(/<d:href>([^<]+)<\/d:href>/g)];
    data = matches
      .map(m => decodeURIComponent(m[1]))
      .filter(href => !href.endsWith(dirPath) && /\.(jpe?g|png|webp)$/i.test(href))
      .map(href => ({ filename: `${dirPath}${href.split('/').pop()}` }));
  } catch (e) {
    if (e.response?.status !== 404) throw e;
  }
  listCache.set(id_user, { at: Date.now(), data });
  return data;
}

const invalidateTempList = id_user => listCache.delete(id_user);



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
  const prefix = `temp/${id_user}/`;
  // sécurité : le client ne peut toucher que ses propres fichiers
  if (!Array.isArray(filenames) ||
      filenames.some(f => typeof f !== 'string' || f.includes('..') || !f.startsWith(prefix))) {
    throw new Error('Nom de fichier invalide');
  }

  const indexed = filenames.map((filename, newSlot) => ({ filename, newSlot }));
  return mapLimit(indexed, 2, async ({ filename, newSlot }) => {
    const nameWithoutPrefix = path.basename(filename).replace(/^\d+-/, '');
    const newFilename = `${prefix}${newSlot}-${nameWithoutPrefix}`;
    if (filename === newFilename) return { oldFilename: filename, newFilename };

    const response = await webdavClient.get(filename, { responseType: 'arraybuffer' });
    await webdavClient.put(newFilename, response.data, {
      headers: { 'Content-Type': response.headers['content-type'] },
      timeout: 30000,
    });
    await webdavClient.delete(filename);
    return { oldFilename: filename, newFilename };
  });
}



async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
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

    // On fetch toutes les images en parallèle
    const images = await mapLimit(filenames, 2, async (filename) => {
      const fullPath = `${dirPath}${filename}`;
      const { data, contentType } = await getImageRawWodMatch(fullPath);
      const base64 = `data:${contentType};base64,${Buffer.from(data).toString('base64')}`;
      return { filename: fullPath, url: base64 };
    });

    return images;
  } catch (e) {
    if (e.response?.status === 404) return [];
    throw e;
  }
}


module.exports = {
  getImageAsBase64, uploadOneImg, getImageRawWodMatch, getImageRaw,
  getUserTempImagesService, reorderTempImagesService,
  listUserTempFilenamesService, invalidateTempList,
}