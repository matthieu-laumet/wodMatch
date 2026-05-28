const express = require('express');
const router = express.Router();

// Routes
const searchModesController = require('../controllers/searchModesController');
const verifyJWT = require('../../middleware/verifyJWT');
const validateProtectedRoutes = require('../../middleware/validateProtectedRoutes');

// ==================== DATA (public) ====================
router.get('/gets-all-searchModes', searchModesController.getSearchModes);

// // ==================== PROTECTION ====================
// router.use(validateProtectedRoutes([
//   '/clean-upsert-user-searchModes'
// ]));
// router.use(verifyJWT); // Tout ce qui suit nécessite JWT
// // ====================================================
// router.post('/clean-upsert-user-searchModes', searchModesController.CleanUpsertUserSearchModes);


module.exports = router;