const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    warrantyNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
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
      required: true
    },
    customerPhone: {
      type: String,
      default: ''
    },
    productName: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: ''
    },
    serialNumber: {
      type: String,
      required: true,
      index: true
    },
    warrantyYears: {
      type: Number,
      default: 5
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    status: {
      type: String,
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Warranty', warrantySchema);
