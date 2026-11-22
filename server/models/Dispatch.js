const mongoose = require('mongoose');

const dispatchSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    dispatchNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    orderId: {
      type: String,
      ref: 'Order',
      required: true
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
    customerAddress: {
      type: String,
      default: ''
    },
    vehicleNo: {
      type: String,
      default: ''
    },
    driverName: {
      type: String,
      default: ''
    },
    driverPhone: {
      type: String,
      default: ''
    },
    dispatchedItems: [mongoose.Schema.Types.Mixed],
    allAllocatedSerials: [{ type: String }],
    dispatchDate: {
      type: Date,
      default: Date.now
    },
    deliveredAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      default: 'In Transit'
    },
    deliveryNotes: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Dispatch', dispatchSchema);
