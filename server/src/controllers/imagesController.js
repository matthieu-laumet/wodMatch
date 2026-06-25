const { getImageRaw, uploadOneImg, listTempImages, getUserTempImagesService, reorderTempImagesService } = require('../services/leevia.service');
const { webdavClient } = require('../utils/leevia.utils');
const crypto = require('crypto');

const ALLOWED_PATH_PATTERN = /^.*$/i;
// const ALLOWED_PATH_PATTERN = /^(app\/competitions\/\d+\/[\w-]+\.(jpg|jpeg|png|gif|webp)|app\/users\/[\w-]+\.(jpg|jpeg|png|gif|webp)|[\w-]+\.(jpg|jpeg|png|gif|webp))$/i;

async function getImage(req, res) {
  try {
    let filename;
    try {
      filename = decodeURIComponent(req.params.filename);
    } catch {
      return res.status(400).json({ error: 'Nom de fichier invalide' });
    }

    if (!filename || filename.includes('..') || !ALLOWED_PATH_PATTERN.test(filename)) {
      return res.status(400).json({ error: 'Nom de fichier invalide' });
    }
    const { data, contentType } = await getImageRaw(filename);
    
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    res.set('ETag', `"${crypto.createHash('md5').update(filename).digest('hex')}"`);
    res.send(data);
  } catch (error) {
    if (error.message === 'Nom de fichier invalide') {
      return res.status(400).json({ error: error.message });
    }
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Avatar non trouvé' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
}


async function uploadImg(req, res) {
  try {
    const result = await uploadOneImg({ file: req.file });
    res.json(result);
  } catch (error) {
    console.error('Erreur upload avatar:', error.message);
    if (error.message === 'Aucun fichier fourni') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Erreur lors de l'upload de l'avatar" });
  }
}


async function uploadTempImages(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }
    const id_user = req.id_user;
    const slot = req.body.slot !== undefined ? parseInt(req.body.slot) : null;
    const results = await Promise.all(
      req.files.map(file => uploadOneImg({ file, prefix: `temp/${id_user}/`, slot }))
    );
    res.json(results);
  } catch (error) {
    console.error('Erreur upload temp:', error.message);
    res.status(500).json({ error: "Erreur lors de l'upload" });
  }
}

async function reorderTempImages(req, res) {
  try {
    const id_user = req.id_user;
    const { filenames } = req.body; // tableau ordonné des filenames actuels
    const results = await reorderTempImagesService({ filenames, id_user })
    res.json(results);
  } catch (error) {
    console.error('Erreur reorder:', error.message);
    res.status(500).json({ error: "Erreur lors du renommage" });
  }
}


async function getUserTempImages(req, res) {
  try {
    const images = await getUserTempImagesService(req.id_user); // [{filename, url}]
    res.json(images);
  } catch (error) {
    console.error('Erreur getUserTempImages:', error.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des images' });
  }
}

async function deleteTempImage(req, res) {
  try {
    const filename = decodeURIComponent(req.params.filename);
    if (!filename) return res.status(400).json({ error: 'Filename manquant' });

    const id_user = req.id_user;
    // Sécurité : on s'assure que le fichier appartient bien à l'utilisateur
    if (!filename.startsWith(`temp/${id_user}/`)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    await webdavClient.delete(filename);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression temp:', error.message);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
}

module.exports = {
  getImage, uploadImg, uploadTempImages, getUserTempImages, reorderTempImages, deleteTempImage
}