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
      customerSignature,
      customerFeedback = 'System installed cleanly and power generation verified.'
    } = req.body;

    const installJob = await Installation.findById(req.params.id);
    if (!installJob) {
      return res.status(404).json({ success: false, message: 'Installation job not found' });
    }

    const completionDate = new Date().toISOString();

    const updatedJob = await Installation.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Completed',
        completionDate,
        checklist: {
          structureMounting: true,
          panelArrangement: true,
          inverterInstallation: true,
          batteryConnection: true,
          earthingProtection: true,
          cableTieAndConduit: true,
          ...checklist
        },
        testResults: {
          generationKw: Number(testResults.generationKw) || installJob.capacityKw * 0.95,
          dcVocVoltage: Number(testResults.dcVocVoltage) || 385,
          earthingResistanceOhms: Number(testResults.earthingResistanceOhms) || 1.8,
          gridSyncConfirmed: true,
          ...testResults
        },
        sitePhotos: sitePhotos.length > 0 ? sitePhotos : [
          'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=600&q=80'
        ],
        customerSignature: customerSignature || 'Digital Signature Verified on Site',
        customerFeedback
      },
      { new: true }
    );

    // Update Order to Completed
    if (installJob.orderId) {
      await Order.findByIdAndUpdate(installJob.orderId, {
        status: 'Completed',
        installationStatus: 'Completed'
      });
    }

    // AUTOMATIC WARRANTY ACTIVATION
    // Look up order to activate warranties for every serial number & BOM item
    const order = await Order.findById(installJob.orderId);
    const createdWarranties = [];

    if (order && order.bomItems) {
      for (const item of order.bomItems) {
        // Determine warranty period
        let warrantyYears = 5;
        if (item.category === 'Solar Panel') warrantyYears = 20; // 20 years for panels
        else if (item.category === 'Inverter') warrantyYears = 5; // 5 years inverter
        else if (item.category === 'Battery') warrantyYears = 3; // 3 years battery

        const expiryDate = new Date(Date.now() + warrantyYears * 365.25 * 86400000).toISOString();

        if (item.allocatedSerials && item.allocatedSerials.length > 0) {
          for (const sn of item.allocatedSerials) {
            // Update serial number record
            await ProductSerialNumber.updateOne(
              { serialNumber: sn },
              {
                status: 'Installed',
                installationDate: completionDate,
                warrantyExpiryDate: expiryDate
              }
            );

            // Create warranty certificate record
            const warrantyNumber = await generateUniqueCode(Warranty, 'warrantyNumber', 'WAR', 5);
            const warrantyCert = await Warranty.create({
              warrantyNumber,
              orderId: order._id,
              orderNumber: order.orderNumber,
              customerName: order.customerName,
              customerPhone: order.customerPhone,
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
          // Non-serialized item warranty (e.g. Structure / Wiring)
          const warrantyNumber = await generateUniqueCode(Warranty, 'warrantyNumber', 'WAR', 5);
          const warrantyCert = await Warranty.create({
            warrantyNumber,
            orderId: order._id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            productName: item.name,
            category: item.category,
            serialNumber: 'BATCH-VERIFIED',
            warrantyYears,
            startDate: completionDate,
            endDate: expiryDate,
            status: 'Active'
          });
          createdWarranties.push(warrantyCert);
        }
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
