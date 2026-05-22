const express = require('express');
const router = express.Router();

// Routes
const funRepsController = require('../controllers/funRepsController');

// ==================== DATA (public) ====================
router.get('/gets-all-funReps', funRepsController.getFunReps);


module.exports = router;