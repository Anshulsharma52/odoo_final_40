const { Warranty, ProductSerialNumber } = require('../models');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Builds flexible regex supporting barcode scanner spacing, hyphens, and casing
const buildFlexibleRegex = (raw) => {
  const clean = String(raw || '').trim();
  if (!clean) return null;
  const tokens = clean.split(/[\s\-_]+/).filter(Boolean);
  if (tokens.length === 0) return null;
  const pattern = tokens.map(escapeRegex).join('[\\s\\-_]*');
  return new RegExp(pattern, 'i');
};

// @desc    Get all warranties (Customer filtered, or search query)
// @route   GET /api/warranties
// @access  Private
const getWarranties = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Customer') {
      const cleanPhone = (req.user.phone || '').replace(/[\s+]/g, '');
      const orConditions = [
        { customerPhone: req.user.phone }
      ];
      if (req.user.email) {
        orConditions.push({ customerEmail: req.user.email });
      }
      if (cleanPhone) {
        orConditions.push({ customerPhone: { $regex: cleanPhone.slice(-10), $options: 'i' } });
      }
      query = { $or: orConditions };
    } else if (req.query.search) {
      const raw = req.query.search.trim();
      const flexRegex = buildFlexibleRegex(raw);
      const digits = raw.replace(/\D/g, '');

      const searchConditions = [
        { serialNumber: flexRegex || { $regex: raw, $options: 'i' } },
        { customerName: { $regex: raw, $options: 'i' } },
        { warrantyNumber: flexRegex || { $regex: raw, $options: 'i' } },
        { orderNumber: flexRegex || { $regex: raw, $options: 'i' } }
      ];

      if (digits.length >= 5) {
        searchConditions.push({ customerPhone: { $regex: digits.slice(-10), $options: 'i' } });
      }

      query = { $or: searchConditions };
    }

    const warranties = await Warranty.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: warranties.length, warranties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Verify warranty by serial number or phone (Service & Support rapid lookup)
// @route   GET /api/warranties/verify/:serialNumber
// @access  Private
const verifyWarrantyBySerial = async (req, res) => {
  try {
    const raw = req.params.serialNumber;
    if (!raw || !raw.trim()) {
      return res.status(400).json({ success: false, message: 'Serial number or phone is required' });
    }

    const cleanInput = raw.trim();
    const flexRegex = buildFlexibleRegex(cleanInput);
    const digitsOnly = cleanInput.replace(/\D/g, '');

    // Construct multi-field flexible query: checks serialNumber, customerPhone, warrantyNumber, orderNumber
    const orConditions = [
      { serialNumber: flexRegex || { $regex: cleanInput, $options: 'i' } },
      { warrantyNumber: flexRegex || { $regex: cleanInput, $options: 'i' } },
      { orderNumber: flexRegex || { $regex: cleanInput, $options: 'i' } }
    ];

    if (digitsOnly.length >= 7) {
      orConditions.push({ customerPhone: { $regex: digitsOnly.slice(-10), $options: 'i' } });
    }

    // Try finding active warranty record first
    let warranty = await Warranty.findOne({ $or: orConditions }).sort({ createdAt: -1 });

    // Fallback search in warehouse ProductSerialNumber inventory
    if (!warranty) {
      const snConditions = [
        { serialNumber: flexRegex || { $regex: cleanInput, $options: 'i' } }
      ];
      if (digitsOnly.length >= 7) {
        snConditions.push({ customerPhone: { $regex: digitsOnly.slice(-10), $options: 'i' } });
      }

      const snRecord = await ProductSerialNumber.findOne({ $or: snConditions });

      if (snRecord) {
        const snObj = snRecord.toObject ? snRecord.toObject() : snRecord;
        return res.json({
          success: true,
          found: true,
          isUnderWarranty: snObj.status === 'Installed',
          status: snObj.status,
          message: `Product serial number found in inventory with status '${snObj.status}'. ${snObj.status === 'Installed' ? 'Installation active.' : 'Installation warranty activates upon commissioning sign-off.'}`,
          warranty: {
            serialNumber: snObj.serialNumber,
            productName: snObj.productName,
            customerName: snObj.customerName || 'Inventory Stock',
            customerPhone: snObj.customerPhone || 'N/A',
            warrantyYears: snObj.warrantyYears || 5,
            startDate: snObj.installationDate || snObj.dispatchedAt || snObj.createdAt,
            endDate: snObj.warrantyExpiryDate || new Date(Date.now() + 5 * 365.25 * 86400000).toISOString(),
            status: snObj.status === 'Installed' ? 'Active' : 'Pending Commissioning'
          },
          serialRecord: snObj
        });
      }

      return res.status(404).json({
        success: false,
        found: false,
        isUnderWarranty: false,
        message: `No active warranty certificate or serialized equipment found for '${cleanInput}'.`
      });
    }

    const warrantyObj = warranty.toObject ? warranty.toObject() : warranty;
    const now = new Date();
    const expiryDate = new Date(warrantyObj.endDate);
    const isUnderWarranty = expiryDate > now && warrantyObj.status === 'Active';
    const diffTime = expiryDate - now;
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    res.json({
      success: true,
      found: true,
      isUnderWarranty,
      daysRemaining,
      warranty: {
        ...warrantyObj,
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
