const express = require('express');
const router = express.Router();
const { recordPayment, getPayments, getInvoices } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/', protect, recordPayment);
router.get('/', protect, getPayments);
router.get('/invoices', protect, getInvoices);

module.exports = router;
