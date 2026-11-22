const { Invoice, Order } = require('../models');
const { generateUniqueCode } = require('../utils/numberGenerator');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Customer') {
      const cleanPhone = (req.user.phone || '').replace(/[\s+]/g, '');
      const orConditions = [
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
    } else if (req.query.orderId) {
      query.orderId = req.query.orderId;
    }

    const invoices = await Invoice.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: invoices.length, invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create invoice manually or from order
// @route   POST /api/invoices
// @access  Private (Sales / Admin)
const createInvoice = async (req, res) => {
  try {
    const {
      orderId,
      orderNumber,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      systemType = 'On-Grid',
      capacityKw = 3,
      items = [],
      subtotal = 0,
      discount = 0,
      subsidyDeduction = 0,
      grandTotal = 0,
      paidAmount = 0,
      balanceDue = 0,
      status = 'Issued',
      dueDate
    } = req.body;

    const invoiceNumber = await generateUniqueCode(Invoice, 'invoiceNumber', 'INV', 4);

    const invoice = await Invoice.create({
      invoiceNumber,
      orderId: orderId || null,
      orderNumber: orderNumber || '',
      customerName,
      customerPhone: customerPhone || '',
      customerEmail: customerEmail || '',
      customerAddress: customerAddress || '',
      systemType,
      capacityKw: Number(capacityKw),
      items,
      subtotal: Number(subtotal),
      discount: Number(discount),
      subsidyDeduction: Number(subsidyDeduction),
      grandTotal: Number(grandTotal),
      paidAmount: Number(paidAmount),
      balanceDue: Number(balanceDue),
      status,
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString()
    });

    res.status(201).json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice
};
