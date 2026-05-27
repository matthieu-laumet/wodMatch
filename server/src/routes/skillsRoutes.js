const express = require('express');
const router = express.Router();

// Routes
const skillsController = require('../controllers/skillsController');
const verifyJWT = require('../../middleware/verifyJWT');
const validateProtectedRoutes = require('../../middleware/validateProtectedRoutes');

// ==================== DATA (public) ====================
router.get('/gets-all-skills', skillsController.getSkills);

// ==================== PROTECTION ====================
router.use(validateProtectedRoutes([
  '/clean-upsert-user-skills'
]));
router.use(verifyJWT); // Tout ce qui suit nécessite JWT
// ====================================================
router.post('/clean-upsert-user-skills', skillsController.CleanUpsertUserSkills);


module.exports = router;