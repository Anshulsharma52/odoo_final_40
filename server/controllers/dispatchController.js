const { Dispatch, Order, ProductSerialNumber, Installation, User, Notification, Product } = require('../models');
const { generateUniqueCode } = require('../utils/numberGenerator');

// @desc    Create dispatch and allocate serial numbers
// @route   POST /api/dispatches
// @access  Private (Warehouse / Admin)
const createDispatch = async (req, res) => {
  try {
    const {
      orderId,
      vehicleNo,
      driverName,
      driverPhone,
      dispatchedItems = [], // [{ productName, serialNumbers: ['INV-001', 'BAT-001'] }]
      notes
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const dispatchNumber = await generateUniqueCode(Dispatch, 'dispatchNumber', 'DSP', 4);

    // Allocate and update serial numbers
    const allAllocatedSerials = [];
    for (const item of dispatchedItems) {
      if (item.serialNumbers && item.serialNumbers.length > 0) {
        for (const sn of item.serialNumbers) {
          allAllocatedSerials.push(sn);
          await ProductSerialNumber.updateOne(
            { serialNumber: sn },
            {
              status: 'Dispatched',
              orderId: order._id,
              orderNumber: order.orderNumber,
              customerName: order.customerName,
              customerPhone: order.customerPhone,
              dispatchedAt: new Date().toISOString()
            }
          );
        }
      }
    }

    // Update order BOM with allocated serials
    const updatedBom = order.bomItems.map(bomItem => {
      const match = dispatchedItems.find(d => d.productName === bomItem.name);
      if (match && match.serialNumbers) {
        return {
          ...bomItem,
          allocatedSerials: match.serialNumbers
        };
      }
      return bomItem;
    });

    const dispatch = await Dispatch.create({
      dispatchNumber,
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      systemType: order.systemType,
      capacityKw: order.capacityKw,
      vehicleNo: vehicleNo || 'MH-12-SP-2026',
      driverName: driverName || 'Ramesh Kumar',
      driverPhone: driverPhone || '+91 98220 11223',
      dispatchedItems,
      allAllocatedSerials,
      status: 'In Transit',
      dispatchDate: new Date().toISOString(),
      notes: notes || 'All components scanned and loaded for delivery.'
    });

    // Update Order status
    await Order.findByIdAndUpdate(orderId, {
      status: 'Dispatched',
      bomItems: updatedBom,
      dispatchStatus: 'Dispatched'
    });

    // Auto-create or schedule Installation Job for installation crew
    const defaultLead = await User.findOne({ role: { $in: ['Technician', 'Field Technician', 'Installation Technician', 'Survey Technician'] } });
    let existingInstall = await Installation.findOne({ orderId: order._id });

    if (!existingInstall) {
      existingInstall = await Installation.create({
        orderId: order._id,
        orderNumber: order.orderNumber,
        dispatchId: dispatch._id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress,
        systemType: order.systemType,
        capacityKw: order.capacityKw,
        allocatedSerials: allAllocatedSerials,
        leadTechnicianId: defaultLead ? defaultLead._id : null,
        leadTechnicianName: defaultLead ? defaultLead.name : 'Vikram Sharma',
        scheduledDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        status: 'Scheduled',
        checklist: {
          structureMounting: false,
          panelArrangement: false,
          inverterInstallation: false,
          batteryConnection: false,
          earthingProtection: false,
          cableTieAndConduit: false
        },
        testResults: {
          generationKw: 0,
          dcVocVoltage: 0,
          earthingResistanceOhms: 0,
          gridSyncConfirmed: false
        },
        sitePhotos: [],
        customerSignature: null
      });
    }

    // Notify Field Technicians
    await Notification.create({
      role: 'Technician',
      title: 'New Installation Job Scheduled!',
      message: `Materials dispatched for ${order.customerName} (${order.capacityKw}kW ${order.systemType}). Assigned to crew schedule.`,
      link: '/installations',
      read: false
    });

    // Notify Customer
    await Notification.create({
      role: 'Customer',
      title: 'Solar System Dispatched!',
      message: `Truck ${vehicleNo || 'MH-12-SP-2026'} is on the way. Driver: ${driverName || 'Ramesh Kumar'}.`,
      link: '/orders',
      read: false
    });

    res.status(201).json({
      success: true,
      message: 'Dispatch processed and installation job assigned successfully',
      dispatch,
      installation: existingInstall
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all dispatches
// @route   GET /api/dispatches
// @access  Private
const getDispatches = async (req, res) => {
  try {
    const dispatches = await Dispatch.find();
    res.json({ success: true, count: dispatches.length, dispatches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createDispatch,
  getDispatches
};
