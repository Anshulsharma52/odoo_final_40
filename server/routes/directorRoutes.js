const express = require('express');
const router = express.Router();
const { getDirectorStats } = require('../controllers/directorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/analytics', protect, authorize('Admin', 'Director'), getDirectorStats);

module.exports = router;
