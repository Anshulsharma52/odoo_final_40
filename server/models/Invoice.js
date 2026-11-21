const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    invoiceNumber: {
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
    customerAddress: {
      type: String,
      default: ''
    },
    systemType: {
      type: String,
      default: 'On-Grid'
    },
    capacityKw: {
      type: Number,
      default: 3
    },
    subtotal: {
      type: Number,
      default: 0
    },
    subsidyDeduction: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      default: 0
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    balanceDue: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      default: 'Generated'
    },
    dueDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
