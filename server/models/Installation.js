const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema(
  {
    structureMounting: { type: Boolean, default: false },
    panelArrangement: { type: Boolean, default: false },
    inverterInstallation: { type: Boolean, default: false },
    batteryConnection: { type: Boolean, default: false },
    earthingProtection: { type: Boolean, default: false },
    cableTieAndConduit: { type: Boolean, default: false }
  },
  { _id: false }
);

const testResultsSchema = new mongoose.Schema(
  {
    generationKw: { type: Number, default: 0 },
    dcVocVoltage: { type: Number, default: 0 },
    earthingResistanceOhms: { type: Number, default: 0 },
    gridSyncConfirmed: { type: Boolean, default: false }
  },
  { _id: false }
);

const installationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
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
    dispatchId: {
      type: String,
      ref: 'Dispatch',
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
    capacityKw: {
      type: Number,
      default: 3
    },
    allocatedSerials: [mongoose.Schema.Types.Mixed],
    leadTechnicianId: {
      type: String,
      ref: 'User',
      default: null
    },
    leadTechnicianName: {
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
    startTime: {
      type: Date
    },
    completionDate: {
      type: Date
    },
    checklist: {
      type: checklistSchema,
      default: () => ({})
    },
    testResults: {
      type: testResultsSchema,
      default: () => ({})
    },
    sitePhotos: [{ type: String }],
    customerSignature: {
      type: String,
      default: null
    },
    customerFeedback: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Installation', installationSchema);
