const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  replenishStock,
  getLowStockAlerts,
  getSerialNumbers,
  addSerialNumbers
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/products', protect, getProducts);
router.post('/products', protect, authorize('Admin', 'Warehouse'), createProduct);
router.put('/products/:id', protect, authorize('Admin', 'Warehouse'), updateProduct);
router.delete('/products/:id', protect, authorize('Admin', 'Warehouse'), deleteProduct);

router.post('/replenish', protect, authorize('Admin', 'Warehouse'), replenishStock);
router.get('/low-stock', protect, getLowStockAlerts);

router.get('/serials', protect, getSerialNumbers);
router.post('/serials', protect, authorize('Admin', 'Warehouse'), addSerialNumbers);

module.exports = router;
