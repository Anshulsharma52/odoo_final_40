const mongoose = require('mongoose');

const productSerialNumberSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    productId: {
      type: String,
      ref: 'Product',
      default: null
    },
    productName: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['In Stock', 'Dispatched', 'Installed', 'Defective'],
      default: 'In Stock'
    },
    orderId: {
      type: String,
      ref: 'Order',
      default: null
    },
    orderNumber: {
      type: String,
      default: ''
    },
    customerName: {
      type: String,
      default: ''
    },
    customerPhone: {
      type: String,
      default: ''
    },
    warrantyYears: {
      type: Number,
      default: 5
    },
    installationDate: {
      type: Date
    },
    warrantyExpiryDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ProductSerialNumber', productSerialNumberSchema);
