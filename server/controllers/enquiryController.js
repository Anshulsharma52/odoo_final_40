const { Enquiry, Customer, Notification, User } = require('../models');

// @desc    Create a new solar enquiry
// @route   POST /api/enquiries
// @access  Public / Customer / Sales / Admin
const createEnquiry = async (req, res) => {
  try {
    const name = (req.body.name || req.body.customerName || req.user?.name || '').trim();
    const phone = (req.body.phone || req.body.customerPhone || req.user?.phone || '').trim();
    const email = (req.body.email || req.body.customerEmail || req.user?.email || '').trim();
    const address = (req.body.address || req.body.customerAddress || req.user?.address || '').trim();
    const {
      systemType = 'On-Grid',
      proposedCapacity = 3,
      monthlyBill = 2500,
      shadowFreeArea = 300,
      electricityConsumerNo,
      notes
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone number are required' });
    }

    const userId = req.user ? req.user._id : null;

    // Find or create customer
    let customer = await Customer.findOne({
      $or: [
        { phone },
        ...(userId ? [{ userId }] : []),
        ...(email ? [{ email }] : [])
      ]
    });
    if (!customer) {
      customer = await Customer.create({
        name,
        phone,
        email: email || '',
        address: address || '',
        electricityConsumerNo: electricityConsumerNo || '',
        monthlyBill: Number(monthlyBill) || 0,
        userId
      });
    } else if (userId && !customer.userId) {
      customer.userId = userId;
      await customer.save();
    }

    const enquiry = await Enquiry.create({
      customerId: customer._id,
      customerName: name,
      customerPhone: phone,
      customerEmail: email || customer.email || '',
      address: address || customer.address || '',
      systemType,
      proposedCapacity: Number(proposedCapacity),
      monthlyBill: Number(monthlyBill),
      shadowFreeArea: Number(shadowFreeArea),
      electricityConsumerNo: electricityConsumerNo || customer.electricityConsumerNo || '',
      status: 'New',
      notes: notes || 'Enquiry received online',
      userId,
      assignedSalesId: null,
      assignedSalesName: null
    });

    // Notify Sales team
    await Notification.create({
      role: 'Sales',
      title: 'New Solar Enquiry Received!',
      message: `${name} requested a ${proposedCapacity}kW ${systemType} system (Bill: ₹${monthlyBill}/mo).`,
      link: '/enquiries',
      read: false
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully! Our solar engineer will contact you.',
      enquiry
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all enquiries with filters
// @route   GET /api/enquiries
// @access  Private
const getEnquiries = async (req, res) => {
  try {
    let query = {};

    // Customer can only see their own enquiries
    if (req.user.role === 'Customer') {
      const cleanPhone = (req.user.phone || '').replace(/[\s+]/g, '');
      const orConditions = [
        { userId: req.user._id },
        { customerPhone: req.user.phone }
      ];
      if (req.user.email) {
        orConditions.push({ customerEmail: req.user.email });
      }
      if (cleanPhone) {
        orConditions.push({ customerPhone: { $regex: cleanPhone.slice(-10), $options: 'i' } });
      }
      query = { $or: orConditions };
    } else if (req.query.status) {
      query.status = req.query.status;
    }

    const enquiries = await Enquiry.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: enquiries.length,
      enquiries
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get enquiry by ID
// @route   GET /api/enquiries/:id
// @access  Private
const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.json({ success: true, enquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update enquiry status or assignment
// @route   PUT /api/enquiries/:id
// @access  Private (Sales / Admin)
const updateEnquiry = async (req, res) => {
  try {
    const { status, notes, assignedSalesId } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;

    if (assignedSalesId) {
      const salesUser = await User.findById(assignedSalesId);
      if (salesUser) {
        updateData.assignedSalesId = salesUser._id;
        updateData.assignedSalesName = salesUser.name;
      }
    }

    const updated = await Enquiry.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    res.json({ success: true, enquiry: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiry
};
