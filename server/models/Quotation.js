const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    quotationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    enquiryId: {
      type: String,
      ref: 'Enquiry',
      default: null
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
    items: [mongoose.Schema.Types.Mixed],
    totalAmount: {
      type: Number,
      default: 0
    },
    discount: {
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
    advanceRequired: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      default: 'Draft'
    },
    validUntil: {
      type: Date
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

module.exports = mongoose.model('Quotation', quotationSchema);
