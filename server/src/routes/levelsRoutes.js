const express = require('express');
const router = express.Router();

// Routes
const levelsController = require('../controllers/levelsController');
const verifyJWT = require('../../middleware/verifyJWT');
const validateProtectedRoutes = require('../../middleware/validateProtectedRoutes');

// ==================== DATA (public) ====================
router.get('/gets-all-levels', levelsController.getLevels);

// // ==================== PROTECTION ====================
// router.use(validateProtectedRoutes([
//   '/clean-upsert-user-levels'
// ]));
// router.use(verifyJWT); // Tout ce qui suit nécessite JWT
// // ====================================================
// router.post('/clean-upsert-user-levels', levelsController.CleanUpsertUserLevels);


module.exports = router;