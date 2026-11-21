const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    receiptNo: {
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
    amount: {
      type: Number,
      required: true
    },
    paymentType: {
      type: String,
      default: 'Advance'
    },
    paymentMethod: {
      type: String,
      default: 'UPI / Online'
    },
    transactionRef: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'Completed'
    },
    paymentDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
