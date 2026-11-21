const express = require('express');
const router = express.Router();
const { generateQuotation, getQuotations, getQuotationById, respondToQuotation } = require('../controllers/quotationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('Admin', 'Sales'), generateQuotation);
router.get('/', protect, getQuotations);
router.get('/:id', protect, getQuotationById);
router.post('/:id/respond', protect, respondToQuotation);

module.exports = router;
