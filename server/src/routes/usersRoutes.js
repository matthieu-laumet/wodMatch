const express = require('express');
const router = express.Router();

// Routes
const usersController = require('../controllers/usersController');
const verifyJWT = require('../../middleware/verifyJWT');
const validateProtectedRoutes = require('../../middleware/validateProtectedRoutes');

// ==================== DATA (public) ====================
// router.get('/gets-all-users', usersController.getUsers);

// ==================== PROTECTION ====================
router.use(validateProtectedRoutes([
  '/get-current-wm-user', '/onboarding-user', '/update-user-prolfil', '/update-user-email', '/update-user-telephone'
]));
router.use(verifyJWT); // Tout ce qui suit nécessite JWT
// ====================================================
router.get('/get-current-wm-user', usersController.getCurrentWMUser);
router.post('/onboarding-user', usersController.onboardingUser);
router.post('/update-user-prolfil', usersController.updateUserProlfil);
router.put('/update-user-email', usersController.updateUserEmail);
router.put('/update-user-telephone', usersController.updateUserTelephone);


module.exports = router;