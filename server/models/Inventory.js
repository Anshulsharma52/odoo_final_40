const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
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
    type: {
      type: String,
      enum: ['INCOMING', 'DISPATCHED', 'ADJUSTMENT', 'RETURN'],
      default: 'INCOMING'
    },
    quantity: {
      type: Number,
      required: true
    },
    supplier: {
      type: String,
      default: ''
    },
    invoiceNo: {
      type: String,
      default: ''
    },
    costPerUnit: {
      type: Number,
      default: 0
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Inventory', inventorySchema);
