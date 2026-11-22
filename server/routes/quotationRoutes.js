const express = require('express');
const router = express.Router();
const {
  generateQuotation,
  getQuotationTemplate,
  getQuotations,
  getQuotationById,
  respondToQuotation,
  updateQuotation
} = require('../controllers/quotationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('Admin', 'Sales'), generateQuotation);
router.put('/:id', protect, authorize('Admin', 'Sales'), updateQuotation);
router.get('/template', protect, getQuotationTemplate);
router.get('/', protect, getQuotations);
router.get('/:id', protect, getQuotationById);
router.post('/:id/respond', protect, respondToQuotation);

module.exports = router;
