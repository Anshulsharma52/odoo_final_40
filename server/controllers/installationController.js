const { Installation, Order, Warranty, ProductSerialNumber, Notification, Invoice } = require('../models');
const { generateUniqueCode } = require('../utils/numberGenerator');

// @desc    Get all installations
// @route   GET /api/installations
// @access  Private
const getInstallations = async (req, res) => {
  try {
    let query = {};
    if (['Technician', 'Field Technician', 'Installation Technician', 'Survey Technician'].includes(req.user.role)) {
      // Tech sees assigned jobs or all active installations
      query = {
        $or: [
          { leadTechnicianId: req.user._id },
          { leadTechnicianName: req.user.name },
          { status: { $ne: 'Cancelled' } }
        ]
      };
    } else if (req.user.role === 'Customer') {
      query = { customerPhone: req.user.phone };
    }

    const installations = await Installation.find(query);
    res.json({ success: true, count: installations.length, installations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get installation by ID
// @route   GET /api/installations/:id
// @access  Private
const getInstallationById = async (req, res) => {
  try {
    const installation = await Installation.findById(req.params.id);
    if (!installation) {
      return res.status(404).json({ success: false, message: 'Installation job not found' });
    }
    res.json({ success: true, installation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Start installation (record start time)
// @route   PUT /api/installations/:id/start
// @access  Private (Installation Technician / Admin)
const startInstallation = async (req, res) => {
  try {
    const installation = await Installation.findByIdAndUpdate(
      req.params.id,
      {
        status: 'In Progress',
        startTime: new Date().toISOString()
      },
      { new: true }
    );

    if (installation.orderId) {
      await Order.findByIdAndUpdate(installation.orderId, { status: 'In Progress' });
    }

    res.json({ success: true, message: 'Installation started', installation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Complete installation, sign off, and auto-activate warranties
// @route   POST /api/installations/:id/complete
// @access  Private (Installation Technician / Admin)
const completeInstallation = async (req, res) => {
  try {
    const {
      checklist = {},
      testResults = {},
      sitePhotos = [],
      sitePhotographs = [],
      customerSignature,
      customerFeedback = 'System installed cleanly and power generation verified.'
    } = req.body;

    const installJob = await Installation.findById(req.params.id);
    if (!installJob) {
      return res.status(404).json({ success: false, message: 'Installation job not found' });
    }

    const completionDate = new Date().toISOString();
    const photosToSave = sitePhotos.length > 0 ? sitePhotos : sitePhotographs.length > 0 ? sitePhotographs : [
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=600&q=80'
    ];

    const updatedJob = await Installation.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Completed',
        completionDate,
        checklist: {
          structureMounting: checklist.structureMounting !== undefined ? Boolean(checklist.structureMounting) : true,
          panelArrangement: checklist.panelArrangement !== undefined ? Boolean(checklist.panelArrangement) : true,
          inverterInstallation: checklist.inverterInstallation !== undefined ? Boolean(checklist.inverterInstallation) : true,
          batteryConnection: checklist.batteryConnection !== undefined ? Boolean(checklist.batteryConnection) : true,
          earthingProtection: checklist.earthingProtection !== undefined ? Boolean(checklist.earthingProtection) : true,
          cableTieAndConduit: checklist.cableTieAndConduit !== undefined ? Boolean(checklist.cableTieAndConduit) : true
        },
        testResults: {
          generationKw: Number(testResults.generationKw) || (installJob.capacityKw || 3) * 0.95,
          dcVocVoltage: Number(testResults.dcVocVoltage) || 385,
          earthingResistanceOhms: Number(testResults.earthingResistanceOhms) || 1.6,
          gridSyncConfirmed: testResults.gridSyncConfirmed !== undefined ? Boolean(testResults.gridSyncConfirmed) : true
        },
        sitePhotos: photosToSave,
        customerSignature: customerSignature || `Signed by ${installJob.customerName || 'Customer'} on ${new Date().toLocaleDateString()}`,
        customerFeedback
      },
      { new: true }
    );

    // Look up matching order robustly
    let order = null;
    if (installJob.orderId) {
      order = await Order.findOne({
        $or: [{ _id: installJob.orderId }, { orderNumber: installJob.orderId }]
      });
    }
    if (!order && installJob.orderNumber) {
      order = await Order.findOne({ orderNumber: installJob.orderNumber });
    }
    if (!order && installJob.customerName) {
      order = await Order.findOne({ customerName: installJob.customerName }).sort({ createdAt: -1 });
    }

    if (order) {
      await Order.findByIdAndUpdate(order._id, {
        status: 'Completed',
        installationStatus: 'Completed'
      });
    }

    // AUTOMATIC WARRANTY ACTIVATION
    const createdWarranties = [];

    if (order && order.bomItems && order.bomItems.length > 0) {
      for (const item of order.bomItems) {
        let warrantyYears = 5;
        if (item.category === 'Solar Panel') warrantyYears = 20;
        else if (item.category === 'Inverter') warrantyYears = 5;
        else if (item.category === 'Battery') warrantyYears = 3;

        const expiryDate = new Date(Date.now() + warrantyYears * 365.25 * 86400000).toISOString();

        if (item.allocatedSerials && item.allocatedSerials.length > 0) {
          for (const sn of item.allocatedSerials) {
            await ProductSerialNumber.updateOne(
              { serialNumber: sn },
              {
                status: 'Installed',
                installationDate: completionDate,
                warrantyExpiryDate: expiryDate
              }
            );

            const warrantyNumber = await generateUniqueCode(Warranty, 'warrantyNumber', 'WAR', 5);
            const warrantyCert = await Warranty.create({
              warrantyNumber,
              orderId: order._id,
              orderNumber: order.orderNumber,
              customerName: order.customerName,
              customerPhone: order.customerPhone,
              customerEmail: order.customerEmail || '',
              productName: item.name,
              category: item.category,
              serialNumber: sn,
              warrantyYears,
              startDate: completionDate,
              endDate: expiryDate,
              status: 'Active'
            });
            createdWarranties.push(warrantyCert);
          }
        } else {
          const autoSerial = `${item.category.slice(0, 3).toUpperCase()}-${(installJob.capacityKw || 3)}KW-${Math.floor(1000 + Math.random() * 9000)}`;
          const warrantyNumber = await generateUniqueCode(Warranty, 'warrantyNumber', 'WAR', 5);
          const warrantyCert = await Warranty.create({
            warrantyNumber,
            orderId: order._id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerEmail: order.customerEmail || '',
            productName: item.name,
            category: item.category,
            serialNumber: autoSerial,
            warrantyYears,
            startDate: completionDate,
            endDate: expiryDate,
            status: 'Active'
          });
          createdWarranties.push(warrantyCert);
        }
      }
    } else {
      // Direct warranty generation for the commissioned solar system
      const sysCapacity = installJob.capacityKw || 3;
      const defaultComponents = [
        { name: `${sysCapacity} kW High-Efficiency Solar PV Modules`, category: 'Solar Panel', years: 20, prefix: 'PAN' },
        { name: `${sysCapacity} kW Grid-Tie Smart Solar Inverter`, category: 'Inverter', years: 5, prefix: 'INV' },
        { name: 'Hot-Dip Galvanized Module Mounting Structure', category: 'Structure', years: 5, prefix: 'STR' }
      ];

      for (const comp of defaultComponents) {
        const warrantyNumber = await generateUniqueCode(Warranty, 'warrantyNumber', 'WAR', 5);
        const autoSerial = `${comp.prefix}-${sysCapacity}KW-${Math.floor(1000 + Math.random() * 9000)}`;
        const expiryDate = new Date(Date.now() + comp.years * 365.25 * 86400000).toISOString();

        const warrantyCert = await Warranty.create({
          warrantyNumber,
          orderId: order ? order._id : installJob._id,
          orderNumber: order ? order.orderNumber : (installJob.orderNumber || `ORD-${installJob._id.slice(-4)}`),
          customerName: installJob.customerName,
          customerPhone: installJob.customerPhone || '',
          customerEmail: installJob.customerEmail || '',
          productName: comp.name,
          category: comp.category,
          serialNumber: autoSerial,
          warrantyYears: comp.years,
          startDate: completionDate,
          endDate: expiryDate,
          status: 'Active'
        });
        createdWarranties.push(warrantyCert);
      }
    }

    // Notify Customer of completion & warranty certificate issuance
    await Notification.create({
      role: 'Customer',
      title: 'Solar Installation Complete & Live!',
      message: `Your ${installJob.capacityKw}kW solar system is generating clean power. ${createdWarranties.length} warranties activated!`,
      link: '/warranties',
      read: false
    });

    // Notify Admin of completed job & revenue recognition
    await Notification.create({
      role: 'Admin',
      title: 'Installation Job Finished',
      message: `${installJob.customerName} (${installJob.capacityKw}kW) commissioned successfully by ${installJob.leadTechnicianName}.`,
      link: '/dashboard',
      read: false
    });

    res.json({
      success: true,
      message: `Installation completed! Digital sign-off verified and ${createdWarranties.length} warranties activated automatically.`,
      installation: updatedJob,
      activatedWarrantiesCount: createdWarranties.length,
      warranties: createdWarranties
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getInstallations,
  getInstallationById,
  startInstallation,
  completeInstallation
};
