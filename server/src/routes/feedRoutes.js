const express = require('express');
const router = express.Router();

// Routes
const feedController = require('../controllers/feed.controller');
const verifyJWT = require('../../middleware/verifyJWT');
const validateProtectedRoutes = require('../../middleware/validateProtectedRoutes');

// ==================== PROTECTION ====================
router.use(validateProtectedRoutes([
  '/get-teams-feed'
]));
router.use(verifyJWT); // Tout ce qui suit nécessite JWT
// ====================================================
router.get('/get-teams-feed/:id_competition', feedController.getFeed);


module.exports = router;