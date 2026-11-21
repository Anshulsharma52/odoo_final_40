const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    name: {
      type: String,
      required: [true, 'Please provide user name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide email address'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: [true, 'Please provide password']
    },
    role: {
      type: String,
      required: true,
      enum: [
        'Admin',
        'Director',
        'Sales',
        'Technician',
        'Field Technician',
        'Survey Technician',
        'Installation Technician',
        'Warehouse',
        'Service & Support',
        'Customer'
      ],
      default: 'Customer'
    },
    phone: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    active: {
      type: Boolean,
      default: true
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
