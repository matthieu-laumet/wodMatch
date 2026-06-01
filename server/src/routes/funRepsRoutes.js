const express = require('express');
const router = express.Router();
const verifyJWT = require('../../middleware/verifyJWT');
const validateProtectedRoutes = require('../../middleware/validateProtectedRoutes');

// Routes
const funRepsController = require('../controllers/funRepsController');

// ==================== DATA (public) ====================

// ==================== PROTECTION ====================
router.use(validateProtectedRoutes([
    '/clean-upsert-user-skills', '/gets-all-funReps', '/upsert-user-fun-reps', '/delete-user-fun-rep'
]));
router.use(verifyJWT); // Tout ce qui suit nécessite JWT
// ====================================================
router.get('/gets-all-funReps', funRepsController.getFunReps);
router.post('/upsert-user-fun-reps', funRepsController.upsertUserFunReps);
router.delete('/delete-user-fun-rep/:id_fun_rep', funRepsController.deleteUserFunRep);


module.exports = router;