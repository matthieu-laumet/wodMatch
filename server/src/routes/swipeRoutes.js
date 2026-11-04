const express = require('express');
const router = express.Router();

// Routes
const swipeController = require('../controllers/swipe.controller');
const verifyJWT = require('../../middleware/verifyJWT');
const validateProtectedRoutes = require('../../middleware/validateProtectedRoutes');

// ==================== PROTECTION ====================
router.use(validateProtectedRoutes([
  '/post-swipe'
]));
router.use(verifyJWT); // Tout ce qui suit nécessite JWT
// ====================================================
router.post('/post-swipe/:id_competition', swipeController.postSwipe);


module.exports = router;