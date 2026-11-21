const { Quotation, Enquiry, Order, Invoice, Notification } = require('../models');
const { getTemplate, generateBOM } = require('../utils/bomGenerator');
const { generateUniqueCode } = require('../utils/numberGenerator');

// @desc    Generate a solar quotation
// @route   POST /api/quotations
// @access  Private (Sales / Admin)
const generateQuotation = async (req, res) => {
  try {
    const {
      enquiryId,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      systemType = 'On-Grid',
      capacityKw = 3,
      customItems = null,
      discount = 0,
      subsidyAmount = null,
      notes = ''
    } = req.body;

    const template = getTemplate(capacityKw, systemType);
    const items = customItems && customItems.length > 0 ? customItems : template.items.map(it => ({
      name: it.name,
      category: it.category,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total: it.quantity * it.unitPrice,
      serialRequired: it.serialRequired
    }));

    const totalAmount = items.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
    const applicableSubsidy = subsidyAmount !== null ? Number(subsidyAmount) : template.subsidyAmount;
    const netPayable = Math.max(0, totalAmount - Number(discount) - applicableSubsidy);
    const advanceRequired = Math.round(netPayable * 0.2); // 20% advance

    const quotationNumber = await generateUniqueCode(Quotation, 'quotationNumber', 'QT', 4);

    const quotation = await Quotation.create({
      quotationNumber,
      enquiryId: enquiryId || null,
      customerName,
      customerPhone: customerPhone || '',
      customerEmail: customerEmail || '',
      customerAddress: customerAddress || '',
      systemType,
      capacityKw: Number(capacityKw),
      items,
      totalAmount,
      discount: Number(discount),
      subsidyAmount: applicableSubsidy,
      netPayable,
      advanceRequired,
      status: 'Sent',
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString(), // 15 days
      notes: notes || 'Quotation generated from SunPower certified package template.',
      createdBy: req.user ? req.user.name : 'Sales Executive'
    });

    if (enquiryId) {
      await Enquiry.findByIdAndUpdate(enquiryId, { status: 'Quoted' });
    }

    // Notify Customer
    await Notification.create({
      role: 'Customer',
      title: 'Quotation Ready for Approval!',
      message: `Your solar quotation ${quotationNumber} for ${capacityKw}kW ${systemType} (₹${netPayable.toLocaleString('en-IN')}) is ready.`,
      link: '/quotations',
      read: false
    });

    res.status(201).json({ success: true, quotation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all quotations
// @route   GET /api/quotations
// @access  Private
const getQuotations = async (req, res) => {
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
    const quotations = await Quotation.find(query);
    res.json({ success: true, count: quotations.length, quotations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get quotation by ID
// @route   GET /api/quotations/:id
// @access  Private
const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }
    res.json({ success: true, quotation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Customer responds to quotation (Accept / Reject)
// @route   POST /api/quotations/:id/respond
// @access  Private (Customer / Sales / Admin)
const respondToQuotation = async (req, res) => {
  try {
    const { action, feedback } = req.body; // action: 'accept' | 'reject'
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    if (action === 'accept') {
      const updatedQuotation = await Quotation.findByIdAndUpdate(
        req.params.id,
        { status: 'Accepted', customerFeedback: feedback || 'Quotation accepted by customer' },
        { new: true }
      );

      // Generate confirmed Order automatically!
      const orderNumber = await generateUniqueCode(Order, 'orderNumber', 'ORD', 4);

      // Generate BOM with packing lists
      const bomItems = quotation.items.map(it => ({
        name: it.name,
        category: it.category,
        quantity: it.quantity,
        serialRequired: it.serialRequired || false,
        allocatedSerials: []
      }));

      const order = await Order.create({
        orderNumber,
        quotationId: quotation._id,
        quotationNumber: quotation.quotationNumber,
        customerName: quotation.customerName,
        customerPhone: quotation.customerPhone,
        customerEmail: quotation.customerEmail,
        customerAddress: quotation.customerAddress,
        systemType: quotation.systemType,
        capacityKw: quotation.capacityKw,
        totalAmount: quotation.totalAmount,
        subsidyAmount: quotation.subsidyAmount,
        netPayable: quotation.netPayable,
        advancePaid: quotation.advanceRequired, // recorded as initial commitment
        balanceDue: quotation.netPayable - quotation.advanceRequired,
        status: 'Confirmed',
        bomItems,
        dispatchStatus: 'Pending',
        installationStatus: 'Pending',
        notes: 'Order confirmed upon quotation acceptance. Ready for Warehouse BOM allocation.'
      });

      // Generate Advance Invoice
      const invoiceNumber = await generateUniqueCode(Invoice, 'invoiceNumber', 'INV', 4);
      await Invoice.create({
        invoiceNumber,
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerName: quotation.customerName,
        customerPhone: quotation.customerPhone,
        customerAddress: quotation.customerAddress,
        systemType: quotation.systemType,
        capacityKw: quotation.capacityKw,
        subtotal: quotation.totalAmount,
        subsidyDeduction: quotation.subsidyAmount,
        grandTotal: quotation.netPayable,
        paidAmount: quotation.advanceRequired,
        balanceDue: quotation.netPayable - quotation.advanceRequired,
        status: 'Partially Paid',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString()
      });

      // Update Enquiry
      if (quotation.enquiryId) {
        await Enquiry.findByIdAndUpdate(quotation.enquiryId, { status: 'Order Confirmed' });
      }

      // Notify Warehouse
      await Notification.create({
        role: 'Warehouse',
        title: 'New Confirmed Order - Prepare BOM Dispatch',
        message: `Order ${orderNumber} for ${quotation.customerName} (${quotation.capacityKw}kW ${quotation.systemType}) is ready for packing & serial scanning.`,
        link: '/orders',
        read: false
      });

      // Notify Sales
      await Notification.create({
        role: 'Sales',
        title: 'Quotation Accepted by Customer!',
        message: `${quotation.customerName} accepted quote ${quotation.quotationNumber}. Order ${orderNumber} created.`,
        link: '/orders',
        read: false
      });

      return res.json({
        success: true,
        message: 'Quotation accepted! Confirmed order & BOM generated.',
        quotation: updatedQuotation,
        order
      });
    } else {
      const updatedQuotation = await Quotation.findByIdAndUpdate(
        req.params.id,
        { status: 'Rejected', customerFeedback: feedback || 'Customer declined quotation' },
        { new: true }
      );
      return res.json({ success: true, message: 'Quotation marked as rejected', quotation: updatedQuotation });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  generateQuotation,
  getQuotations,
  getQuotationById,
  respondToQuotation
};
