const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    customerId: {
      type: String,
      ref: 'Customer',
      default: null
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true
    },
    customerEmail: {
      type: String,
      default: '',
      trim: true
    },
    address: {
      type: String,
      default: ''
    },
    systemType: {
      type: String,
      default: 'On-Grid'
    },
    proposedCapacity: {
      type: Number,
      default: 3
    },
    monthlyBill: {
      type: Number,
      default: 0
    },
    shadowFreeArea: {
      type: Number,
      default: 0
    },
    electricityConsumerNo: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'New'
    },
    notes: {
      type: String,
      default: ''
    },
    userId: {
      type: String,
      ref: 'User',
      default: null
    },
    assignedSalesId: {
      type: String,
      ref: 'User',
      default: null
    },
    assignedSalesName: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
