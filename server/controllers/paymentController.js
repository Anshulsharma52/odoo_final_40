const { Payment, Invoice, Order, Notification } = require('../models');
const { generateUniqueCode } = require('../utils/numberGenerator');

// @desc    Record a customer payment
// @route   POST /api/payments
// @access  Private (Sales / Admin / Customer)
const recordPayment = async (req, res) => {
  try {
    const {
      orderId,
      amount,
      paymentType = 'Advance', // Advance | Milestone | Final | Maintenance
      paymentMethod = 'UPI', // UPI | Bank Transfer | Card | Cash | Cheque
      transactionRef,
      notes
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const receiptNo = await generateUniqueCode(Payment, 'receiptNo', 'REC', 4);

    const paymentAmount = Number(amount);

    const payment = await Payment.create({
      receiptNo,
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      amount: paymentAmount,
      paymentType,
      paymentMethod,
      transactionRef: transactionRef || `TXN-${Date.now().toString().slice(-8)}`,
      status: 'Completed',
      notes: notes || 'Payment processed successfully',
      paymentDate: new Date().toISOString()
    });

    // Update order balance
    const currentPaid = (order.advancePaid || 0) + paymentAmount;
    const newBalance = Math.max(0, (order.netPayable || order.totalAmount) - currentPaid);

    await Order.findByIdAndUpdate(orderId, {
      advancePaid: currentPaid,
      balanceDue: newBalance
    });

    // Update linked invoice if any
    const invoice = await Invoice.findOne({ orderId: order._id });
    if (invoice) {
      const invPaid = (invoice.paidAmount || 0) + paymentAmount;
      const invBalance = Math.max(0, invoice.grandTotal - invPaid);
      await Invoice.findByIdAndUpdate(invoice._id, {
        paidAmount: invPaid,
        balanceDue: invBalance,
        status: invBalance === 0 ? 'Paid' : 'Partially Paid'
      });
    }

    // Notify Customer
    await Notification.create({
      role: 'Customer',
      title: 'Payment Received!',
      message: `Receipt ${receiptNo} for ₹${paymentAmount.toLocaleString('en-IN')} confirmed for Order ${order.orderNumber}.`,
      link: '/payments',
      read: false
    });

    res.status(201).json({
      success: true,
      message: `Payment of ₹${paymentAmount.toLocaleString('en-IN')} recorded successfully`,
      payment,
      balanceDue: newBalance
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
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
    }
    const payments = await Payment.find(query);
    res.json({ success: true, count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

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
    }
    const invoices = await Invoice.find(query);
    res.json({ success: true, count: invoices.length, invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  recordPayment,
  getPayments,
  getInvoices
};
