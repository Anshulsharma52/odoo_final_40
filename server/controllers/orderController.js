const { Order, Installation, Notification } = require('../models');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
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
    const orders = await Order.find(query);
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Warehouse / Installation / Sales / Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  updateOrderStatus
};
