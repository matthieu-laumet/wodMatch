const express = require('express');
const router = express.Router();
const likesController = require('../controllers/likes.controller');
const verifyJWT = require('../../middleware/verifyJWT');
const validateProtectedRoutes = require('../../middleware/validateProtectedRoutes');

router.use(validateProtectedRoutes(['/get-likes-hub']));
router.use(verifyJWT);
router.get('/get-likes-hub', likesController.getHub);

module.exports = router;