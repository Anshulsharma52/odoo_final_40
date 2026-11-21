const mongoose = require('mongoose');

const serviceTicketSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: String,
      ref: 'User',
      default: null,
      index: true
    },
    customerName: {
      type: String,
      required: true
    },
    customerPhone: {
      type: String,
      required: true
    },
    customerEmail: {
      type: String,
      default: ''
    },
    customerAddress: {
      type: String,
      default: ''
    },
    productName: {
      type: String,
      default: ''
    },
    serialNumber: {
      type: String,
      default: ''
    },
    faultCode: {
      type: String,
      default: ''
    },
    issueCategory: {
      type: String,
      default: 'Inverter Fault'
    },
    description: {
      type: String,
      default: ''
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open'
    },
    isUnderWarranty: {
      type: Boolean,
      default: true
    },
    costBilledToCustomer: {
      type: Number,
      default: 0
    },
    assignedTechnicianId: {
      type: String,
      ref: 'User',
      default: null
    },
    assignedTechnicianName: {
      type: String,
      default: ''
    },
    resolutionNotes: {
      type: String,
      default: ''
    },
    partsReplaced: [mongoose.Schema.Types.Mixed],
    customerConfirmed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ServiceTicket', serviceTicketSchema);
