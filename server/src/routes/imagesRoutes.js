const express = require('express');
const router = express.Router();
const validateProtectedRoutes = require('../../middleware/validateProtectedRoutes');
const verifyJWT = require('../../middleware/verifyJWT');
const multerErrorHandler = require('../../middleware/multerErrorHandler');
const multer = require('multer');

// Routes
const imagesController = require('../controllers/imagesController');

// Configuration multer pour gérer l'upload en mémoire
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const fileMimeType = file.mimetype.toLowerCase();
    if (allowedMimes.includes(fileMimeType)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Formats acceptés.\nJPEG, JPG, PNG, GIF, WEBP'));
    }
  }
});

// ==================== DATA (public) ====================
router.get('/get-one-image/:filename', imagesController.getImage);

// ==================== PROTECTION ====================
router.use(validateProtectedRoutes([
  '/upload-temp-images', '/get-user-temp-images', '/delete-temp-image', '/reorder-temp-images'
]));
router.use(verifyJWT); // Tout ce qui suit nécessite JWT
// ====================================================
router.get('/get-user-temp-images', imagesController.getUserTempImages);
router.post('/upload-temp-images', upload.array('files', 6), multerErrorHandler, imagesController.uploadTempImages);
router.post('/reorder-temp-images', imagesController.reorderTempImages);
router.delete('/delete-temp-image/:filename', imagesController.deleteTempImage);


module.exports = router;