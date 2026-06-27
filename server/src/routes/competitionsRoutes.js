const express = require('express');
const router = express.Router();

// Routes
const competitionssController = require('../controllers/competitions.controller');
const verifyJWT = require('../../middleware/verifyJWT');
const validateProtectedRoutes = require('../../middleware/validateProtectedRoutes');

// ==================== DATA (public) ====================

// ==================== PROTECTION ====================
router.use(validateProtectedRoutes([
  '/get-wz-competitions'
]));
router.use(verifyJWT); // Tout ce qui suit nécessite JWT
// ====================================================
router.get('/get-wz-competitions', competitionssController.getWZCompetitions);


module.exports = router;