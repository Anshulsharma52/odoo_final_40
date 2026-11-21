const { Warranty, ProductSerialNumber } = require('../models');

// @desc    Get all warranties
// @route   GET /api/warranties
// @access  Private
const getWarranties = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Customer') {
      query = { customerPhone: req.user.phone };
    } else if (req.query.search) {
      const search = req.query.search;
      query = {
        $or: [
          { serialNumber: { $regex: search, $options: 'i' } },
          { customerPhone: { $regex: search, $options: 'i' } },
          { customerName: { $regex: search, $options: 'i' } },
          { warrantyNumber: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const warranties = await Warranty.find(query);
    res.json({ success: true, count: warranties.length, warranties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Verify warranty by serial number (Service & Support fast lookup)
// @route   GET /api/warranties/verify/:serialNumber
// @access  Private
const verifyWarrantyBySerial = async (req, res) => {
  try {
    const { serialNumber } = req.params;
    if (!serialNumber) {
      return res.status(400).json({ success: false, message: 'Serial number is required' });
    }

    const warranty = await Warranty.findOne({
      serialNumber: { $regex: `^${serialNumber.trim()}$`, $options: 'i' }
    });

    if (!warranty) {
      // Check if serial exists in warehouse but not yet installed
      const snRecord = await ProductSerialNumber.findOne({
        serialNumber: { $regex: `^${serialNumber.trim()}$`, $options: 'i' }
      });

      if (snRecord) {
        return res.json({
          success: true,
          found: true,
          isUnderWarranty: false,
          status: snRecord.status,
          message: `Product serial number found in inventory with status '${snRecord.status}', but installation warranty is not yet active.`,
          serialRecord: snRecord
        });
      }

      return res.status(404).json({
        success: false,
        found: false,
        isUnderWarranty: false,
        message: `No warranty or inventory record found for serial number '${serialNumber}'.`
      });
    }

    const now = new Date();
    const expiryDate = new Date(warranty.endDate);
    const isUnderWarranty = expiryDate > now && warranty.status === 'Active';
    const diffTime = expiryDate - now;
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    res.json({
      success: true,
      found: true,
      isUnderWarranty,
      daysRemaining,
      warranty: {
        ...warranty,
        isUnderWarranty,
        daysRemaining
      },
      coverageType: isUnderWarranty ? 'FREE_REPLACEMENT_OR_REPAIR' : 'OUT_OF_WARRANTY_PAID'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getWarranties,
  verifyWarrantyBySerial
};
