const express = require('express');
const router = express.Router();
const {
  createDispatch,
  getDispatches,
  updateDispatchStatus
} = require('../controllers/dispatchController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('Admin', 'Warehouse'), createDispatch);
router.get('/', protect, getDispatches);
router.put('/:id/status', protect, authorize('Admin', 'Warehouse'), updateDispatchStatus);
router.put('/:id', protect, authorize('Admin', 'Warehouse'), updateDispatchStatus);

module.exports = router;
