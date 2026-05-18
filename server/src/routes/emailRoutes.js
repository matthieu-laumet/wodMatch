const express = require('express');
const router = express.Router();
const validateProtectedRoutes = require('../../middleware/validateProtectedRoutes');
const verifyJWT = require('../../middleware/verifyJWT');
const ROLES_LIST = require('../../config/roles_list');
const verifyCompetitionAccess = require('../../middleware/verifyCompetitionAccess');

// Routes
const emailController = require('../controllers/emailController');

// ==================== DATA (public) ====================
router.get('/confirm-email/:id/:token/:isFor', emailController.verifyTokenVerifyEmail);
router.post('/send-mail', emailController.sendMail);
router.post('/forgot-pwd-reset', emailController.updatePwdForgot);
router.get('/forgot-pwd/:id/:token/', emailController.verifyTokenResetPwd);
router.post('/forgot-pwd', emailController.sendMailForgotPwd);

// ==================== PROTECTION ====================
router.use(validateProtectedRoutes([
  '/verify-token-open-QueueTicket', '/generate-token-ticket', '/send-group-mails'
]));
router.use(verifyJWT); // Tout ce qui suit nécessite JWT
// ====================================================
router.get('/verify-token-open-QueueTicket/:id_division/:token', emailController.verifyTokenOpenQueueTicket);

// ==================== ADMIN ====================
const adminAccess = verifyCompetitionAccess(ROLES_LIST['FULL_ADMIN']);  // Tout ce qui suit nécessite etre du roles 2 admin
// ===============================================
router.post('/generate-token-ticket', adminAccess, emailController.generateTokenTicket);
router.post('/send-group-mails', adminAccess, emailController.sendGroupMails);


module.exports = router;