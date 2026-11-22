const express = require('express');
const router = express.Router();
const { getInvoices, getInvoiceById, createInvoice } = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);

module.exports = router;
