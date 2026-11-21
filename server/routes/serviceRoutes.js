const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket
} = require('../controllers/serviceTicketController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createTicket);
router.get('/', protect, getTickets);
router.get('/:id', protect, getTicketById);
router.put('/:id', protect, updateTicket);

module.exports = router;
