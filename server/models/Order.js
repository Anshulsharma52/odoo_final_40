const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    quotationNumber: {
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
    customerEmail: {
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
    totalAmount: {
      type: Number,
      default: 0
    },
    subsidyAmount: {
      type: Number,
      default: 0
    },
    netPayable: {
      type: Number,
      default: 0
    },
    advancePaid: {
      type: Number,
      default: 0
    },
    balanceDue: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      default: 'Confirmed'
    },
    dispatchStatus: {
      type: String,
      default: 'Pending'
    },
    installationStatus: {
      type: String,
      default: 'Pending'
    },
    bomItems: [mongoose.Schema.Types.Mixed]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);
