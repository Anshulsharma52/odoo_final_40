const express = require('express');
const router = express.Router();
const { getWarranties, verifyWarrantyBySerial } = require('../controllers/warrantyController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getWarranties);
router.get('/verify/:serialNumber', protect, verifyWarrantyBySerial);

module.exports = router;
