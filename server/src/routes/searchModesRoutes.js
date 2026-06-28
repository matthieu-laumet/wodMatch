const express = require('express');
const router = express.Router();

// Routes
const searchModesController = require('../controllers/searchModesController');
const verifyJWT = require('../../middleware/verifyJWT');
const validateProtectedRoutes = require('../../middleware/validateProtectedRoutes');

// ==================== DATA (public) ====================
router.get('/gets-all-searchModes', searchModesController.getSearchModes);

// // ==================== PROTECTION ====================
router.use(validateProtectedRoutes([
  '/handle-user-search-mode'
]));
router.use(verifyJWT); // Tout ce qui suit nécessite JWT
// // ====================================================
router.post('/handle-user-search-mode', searchModesController.handleUserSearchMode);


module.exports = router;