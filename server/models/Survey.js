const mongoose = require('mongoose');

const surveyReportSchema = new mongoose.Schema(
  {
    roofAreaSqFt: { type: Number, default: 0 },
    direction: { type: String, default: 'South-Facing' },
    tiltAngle: { type: Number, default: 18 },
    shadowFreeSpaceSqFt: { type: Number, default: 0 },
    cableDistanceMeters: { type: Number, default: 0 },
    roofType: { type: String, default: 'RCC Concrete Roof' },
    obstacles: { type: String, default: '' },
    sanctionLoadKw: { type: Number, default: 5 },
    supplyType: { type: String, default: 'Single Phase' },
    approved: { type: Boolean, default: true },
    approvedCapacity: { type: Number, default: 3 },
    inspectionNotes: { type: String, default: '' },
    photographs: [{ type: String }],
    completedAt: { type: Date }
  },
  { _id: false }
);

const surveySchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    enquiryId: {
      type: String,
      ref: 'Enquiry',
      default: null
    },
    customerId: {
      type: String,
      ref: 'Customer',
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
    customerAddress: {
      type: String,
      default: ''
    },
    systemType: {
      type: String,
      default: 'On-Grid'
    },
    requestedCapacity: {
      type: Number,
      default: 3
    },
    technicianId: {
      type: String,
      ref: 'User',
      default: null
    },
    technicianName: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'Scheduled'
    },
    scheduledDate: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      default: ''
    },
    report: {
      type: surveyReportSchema,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Survey', surveySchema);
