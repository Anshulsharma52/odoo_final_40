const { ServiceTicket, Warranty, User, Notification, Customer } = require('../models');

// @desc    Create a new service complaint/ticket
// @route   POST /api/service-tickets
// @access  Private (Customer / Service & Support / Admin)
const createTicket = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerAddress,
      serialNumber,
      productName,
      faultCode,
      issueCategory = 'Inverter Fault',
      description,
      priority = 'High'
    } = req.body;

    if (!customerPhone || !description) {
      return res.status(400).json({ success: false, message: 'Customer phone and issue description are required' });
    }

    // Check warranty coverage automatically via serial number or customer phone
    let isUnderWarranty = false;
    let warrantyRef = null;

    if (serialNumber) {
      const warranty = await Warranty.findOne({
        serialNumber: { $regex: `^${serialNumber.trim()}$`, $options: 'i' }
      });
      if (warranty && warranty.status === 'Active' && new Date(warranty.endDate) > new Date()) {
        isUnderWarranty = true;
        warrantyRef = warranty;
      }
    } else {
      // Check if customer has any active warranty
      const warranty = await Warranty.findOne({ customerPhone });
      if (warranty && warranty.status === 'Active' && new Date(warranty.endDate) > new Date()) {
        isUnderWarranty = true;
        warrantyRef = warranty;
      }
    }

    const count = await ServiceTicket.countDocuments();
    const ticketNumber = `TKT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const defaultTech = await User.findOne({ role: 'Service & Support' });

    const ticket = await ServiceTicket.create({
      ticketNumber,
      customerName: customerName || (warrantyRef ? warrantyRef.customerName : 'Customer'),
      customerPhone,
      customerAddress: customerAddress || '',
      productName: productName || (warrantyRef ? warrantyRef.productName : 'Solar Inverter / System'),
      serialNumber: serialNumber || (warrantyRef ? warrantyRef.serialNumber : 'NOT-PROVIDED'),
      faultCode: faultCode || 'ERR-0',
      issueCategory,
      description,
      priority,
      status: 'Open',
      isUnderWarranty,
      costBilledToCustomer: isUnderWarranty ? 0 : 2500, // ₹0 if covered, standard diagnostic fee if out of warranty
      assignedTechnicianId: defaultTech ? defaultTech._id : null,
      assignedTechnicianName: defaultTech ? defaultTech.name : 'Support Engineer',
      resolutionNotes: '',
      partsReplaced: [],
      customerConfirmed: false
    });

    // Notify Service team
    await Notification.create({
      role: 'Service & Support',
      title: `New Ticket ${ticketNumber} (${issueCategory})`,
      message: `${ticket.customerName} reported ${issueCategory} (Fault: ${faultCode || 'None'}). Warranty: ${isUnderWarranty ? 'FREE (Covered)' : 'PAID OUT-OF-WARRANTY'}.`,
      link: '/service-tickets',
      read: false
    });

    res.status(201).json({
      success: true,
      message: 'Service ticket created successfully',
      ticket,
      warrantyStatus: isUnderWarranty ? 'UNDER_WARRANTY_FREE_SERVICE' : 'OUT_OF_WARRANTY'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all service tickets
// @route   GET /api/service-tickets
// @access  Private
const getTickets = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Customer') {
      query = { customerPhone: req.user.phone };
    } else if (req.query.status) {
      query.status = req.query.status;
    } else if (req.query.search) {
      const search = req.query.search;
      query = {
        $or: [
          { ticketNumber: { $regex: search, $options: 'i' } },
          { customerPhone: { $regex: search, $options: 'i' } },
          { serialNumber: { $regex: search, $options: 'i' } },
          { customerName: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const tickets = await ServiceTicket.find(query);
    res.json({ success: true, count: tickets.length, tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get service ticket by ID
// @route   GET /api/service-tickets/:id
// @access  Private
const getTicketById = async (req, res) => {
  try {
    const ticket = await ServiceTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update ticket status, assign technician, or resolve
// @route   PUT /api/service-tickets/:id
// @access  Private (Service & Support / Admin / Customer)
const updateTicket = async (req, res) => {
  try {
    const {
      status,
      assignedTechnicianId,
      assignedTechnicianName,
      resolutionNotes,
      partsReplaced,
      costBilledToCustomer,
      customerConfirmed
    } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (assignedTechnicianId) updateData.assignedTechnicianId = assignedTechnicianId;
    if (assignedTechnicianName) updateData.assignedTechnicianName = assignedTechnicianName;
    if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
    if (partsReplaced) updateData.partsReplaced = partsReplaced;
    if (costBilledToCustomer !== undefined) updateData.costBilledToCustomer = Number(costBilledToCustomer);
    if (customerConfirmed !== undefined) updateData.customerConfirmed = Boolean(customerConfirmed);

    if (status === 'Resolved' || status === 'Closed') {
      updateData.resolvedAt = new Date().toISOString();
    }

    const ticket = await ServiceTicket.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Notify Customer when resolved
    if (status === 'Resolved') {
      await Notification.create({
        role: 'Customer',
        title: `Service Ticket ${ticket.ticketNumber} Resolved`,
        message: `Your solar issue has been addressed. Please verify and confirm resolution.`,
        link: '/service-tickets',
        read: false
      });
    }

    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket
};
