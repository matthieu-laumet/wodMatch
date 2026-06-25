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
  '/get-current-wm-user', '/onboarding-user', '/update-user-prolfil', '/update-user-email', '/update-user-telephone',
  '/handle-hide-user-profil', '/get-blocked-athlets', '/add-blocked-user', '/delete-blocked-user', '/get-visibles-athlete-lists'
]));
router.use(verifyJWT); // Tout ce qui suit nécessite JWT
// ====================================================
router.get('/get-current-wm-user', usersController.getCurrentWMUser);
router.get('/get-blocked-athlets', usersController.getBlockedAthlets);
router.get('/get-visibles-athlete-lists', usersController.getVisiblesAthleteLists);
router.post('/onboarding-user', usersController.onboardingUser);
router.post('/update-user-prolfil', usersController.updateUserProlfil);
router.post('/add-blocked-user', usersController.addBlockedUser);
router.put('/update-user-email', usersController.updateUserEmail);
router.put('/update-user-telephone', usersController.updateUserTelephone);
router.put('/handle-hide-user-profil', usersController.handleHideUserProfil);
router.delete('/delete-blocked-user/:id_user_blocked/:blocked_email', usersController.deleteBlockedUser);


module.exports = router;