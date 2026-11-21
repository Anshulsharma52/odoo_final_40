const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    brand: {
      type: String,
      default: ''
    },
    model: {
      type: String,
      default: ''
    },
    specification: {
      type: String,
      default: ''
    },
    unitCost: {
      type: Number,
      default: 0
    },
    unitSellingPrice: {
      type: Number,
      default: 0
    },
    warrantyYears: {
      type: Number,
      default: 5
    },
    serialRequired: {
      type: Boolean,
      default: false
    },
    currentStock: {
      type: Number,
      default: 0
    },
    minStockAlert: {
      type: Number,
      default: 5
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
