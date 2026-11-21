const { Product, Inventory, ProductSerialNumber, Notification } = require('../models');

// @desc    Get all products
// @route   GET /api/inventory/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create new product
// @route   POST /api/inventory/products
// @access  Private (Warehouse / Admin)
const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      model,
      specification,
      unitCost,
      unitSellingPrice,
      warrantyYears = 5,
      serialRequired = false,
      currentStock = 0,
      minStockAlert = 5,
      imageUrl
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Name and category are required' });
    }

    const product = await Product.create({
      name,
      category,
      brand: brand || 'SunPower Standard',
      model: model || '2026 Edition',
      specification: specification || '',
      unitCost: Number(unitCost) || 0,
      unitSellingPrice: Number(unitSellingPrice) || 0,
      warrantyYears: Number(warrantyYears),
      serialRequired: Boolean(serialRequired),
      currentStock: Number(currentStock),
      minStockAlert: Number(minStockAlert),
      imageUrl: imageUrl || ''
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update product
// @route   PUT /api/inventory/products/:id
// @access  Private (Warehouse / Admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/inventory/products/:id
// @access  Private (Warehouse / Admin)
const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Replenish stock (Incoming Stock)
// @route   POST /api/inventory/replenish
// @access  Private (Warehouse / Admin)
const replenishStock = async (req, res) => {
  try {
    const { productId, quantity, supplier, invoiceNo, costPerUnit } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const newStock = (product.currentStock || 0) + Number(quantity);
    await Product.findByIdAndUpdate(productId, { currentStock: newStock });

    // Record inventory ledger
    await Inventory.create({
      productId,
      productName: product.name,
      type: 'INCOMING',
      quantity: Number(quantity),
      supplier: supplier || 'SunPower Global Supply',
      invoiceNo: invoiceNo || `SUP-${Date.now()}`,
      costPerUnit: Number(costPerUnit) || product.unitCost,
      date: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `Added ${quantity} units of ${product.name}. Current stock: ${newStock}`,
      currentStock: newStock
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get low stock alerts
// @route   GET /api/inventory/low-stock
// @access  Private
const getLowStockAlerts = async (req, res) => {
  try {
    const products = await Product.find();
    const lowStock = products.filter(p => Number(p.currentStock) <= Number(p.minStockAlert));
    res.json({ success: true, count: lowStock.length, products: lowStock });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get serial numbers
// @route   GET /api/inventory/serials
// @access  Private
const getSerialNumbers = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.category) query.category = req.query.category;
    if (req.query.search) {
      query.serialNumber = { $regex: req.query.search, $options: 'i' };
    }

    const serials = await ProductSerialNumber.find(query);
    res.json({ success: true, count: serials.length, serials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add batch serial numbers
// @route   POST /api/inventory/serials
// @access  Private (Warehouse / Admin)
const addSerialNumbers = async (req, res) => {
  try {
    const { productId, serialsList } = req.body; // serialsList: array of strings or comma-separated string
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let serials = [];
    if (Array.isArray(serialsList)) {
      serials = serialsList;
    } else if (typeof serialsList === 'string') {
      serials = serialsList.split(',').map(s => s.trim()).filter(Boolean);
    }

    const created = [];
    for (const sn of serials) {
      const existing = await ProductSerialNumber.findOne({ serialNumber: sn });
      if (!existing) {
        const item = await ProductSerialNumber.create({
          serialNumber: sn,
          productId: product._id,
          productName: product.name,
          category: product.category,
          status: 'In Stock',
          orderId: null,
          customerName: null,
          warrantyYears: product.warrantyYears || 5
        });
        created.push(item);
      }
    }

    // Auto-update stock count if greater
    const currentTotal = await ProductSerialNumber.countDocuments({ productId: product._id, status: 'In Stock' });
    if (currentTotal > product.currentStock) {
      await Product.findByIdAndUpdate(productId, { currentStock: currentTotal });
    }

    res.status(201).json({
      success: true,
      message: `Successfully registered ${created.length} new serial numbers`,
      created
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  replenishStock,
  getLowStockAlerts,
  getSerialNumbers,
  addSerialNumbers
};
