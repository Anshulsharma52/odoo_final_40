const express = require('express');
const router = express.Router();
const { createEnquiry, getEnquiries, getEnquiryById, updateEnquiry } = require('../controllers/enquiryController');
const { protect, authorize } = require('../middleware/auth');

// Public can submit an enquiry, or logged in users
router.post('/', (req, res, next) => {
  // Optional auth
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, createEnquiry);

router.get('/', protect, getEnquiries);
router.get('/:id', protect, getEnquiryById);
router.put('/:id', protect, authorize('Admin', 'Sales'), updateEnquiry);

module.exports = router;
