const express = require('express');
const router = express.Router();
const { createDispatch, getDispatches } = require('../controllers/dispatchController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('Admin', 'Warehouse'), createDispatch);
router.get('/', protect, getDispatches);

module.exports = router;
