const express = require('express');
const router = express.Router();

// Routes
const strengthsController = require('../controllers/strengthsController');

// ==================== DATA (public) ====================
router.get('/gets-all-strengths', strengthsController.getStrengths);


module.exports = router;