const { Survey, Enquiry, User, Notification } = require('../models');

// @desc    Schedule a site survey
// @route   POST /api/surveys/schedule
// @access  Private (Sales / Admin)
const scheduleSurvey = async (req, res) => {
  try {
    const { enquiryId, technicianId, scheduledDate, notes } = req.body;

    const enquiry = await Enquiry.findById(enquiryId);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    let technicianName = 'Assigned Tech';
    if (technicianId) {
      const tech = await User.findById(technicianId);
      if (tech) technicianName = tech.name;
    } else {
      // Find default survey technician
      const defaultTech = await User.findOne({ role: { $in: ['Technician', 'Field Technician', 'Survey Technician'] } });
      if (defaultTech) technicianName = defaultTech.name;
    }

    const survey = await Survey.create({
      enquiryId: enquiry._id,
      customerId: enquiry.customerId,
      customerName: enquiry.customerName,
      customerPhone: enquiry.customerPhone,
      customerAddress: enquiry.address,
      systemType: enquiry.systemType,
      requestedCapacity: enquiry.proposedCapacity,
      technicianId: technicianId || null,
      technicianName,
      scheduledDate: scheduledDate || new Date(Date.now() + 86400000).toISOString(),
      status: 'Scheduled',
      notes: notes || 'Site survey visit scheduled',
      report: null
    });

    // Update enquiry status
    await Enquiry.findByIdAndUpdate(enquiryId, { status: 'Survey Scheduled' });

    // Notify Field Technicians
    await Notification.create({
      role: 'Technician',
      title: 'New Site Survey Assigned',
      message: `Survey assigned for ${enquiry.customerName} (${enquiry.address}) on ${new Date(survey.scheduledDate).toLocaleDateString()}.`,
      link: '/surveys',
      read: false
    });

    // Notify Customer
    if (enquiry.userId) {
      await Notification.create({
        userId: enquiry.userId,
        role: 'Customer',
        title: 'Site Survey Scheduled!',
        message: `Our technician ${technicianName} will visit your roof on ${new Date(survey.scheduledDate).toLocaleDateString()}.`,
        link: '/surveys',
        read: false
      });
    }

    res.status(201).json({ success: true, survey });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get surveys
// @route   GET /api/surveys
// @access  Private
const getSurveys = async (req, res) => {
  try {
    let query = {};
    if (['Technician', 'Field Technician', 'Survey Technician', 'Installation Technician'].includes(req.user.role)) {
      // Show assigned surveys or all for easy testing
      query = {
        $or: [
          { technicianId: req.user._id },
          { technicianName: req.user.name },
          { status: { $ne: 'Cancelled' } }
        ]
      };
    } else if (req.user.role === 'Customer') {
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
    }

    const surveys = await Survey.find(query);
    res.json({ success: true, count: surveys.length, surveys });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get survey by ID
// @route   GET /api/surveys/:id
// @access  Private
const getSurveyById = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    res.json({ success: true, survey });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Submit Survey Report (Survey Technician)
// @route   POST /api/surveys/:id/report
// @access  Private (Survey Technician / Admin)
const submitSurveyReport = async (req, res) => {
  try {
    const {
      roofAreaSqFt = 450,
      direction = 'South-Facing',
      tiltAngle = 18,
      shadowFreeSpaceSqFt = 350,
      cableDistanceMeters = 30,
      roofType = 'RCC Concrete Roof',
      obstacles = 'Water tank on North-East corner, no shadow',
      sanctionLoadKw = 5,
      supplyType = '3-Phase',
      approved = true,
      approvedCapacity = 3,
      inspectionNotes = 'Excellent solar potential with zero shadow throughout the day. Recommended 3 kW On-Grid system.',
      photographs = []
    } = req.body;

    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const report = {
      roofAreaSqFt: Number(roofAreaSqFt),
      direction,
      tiltAngle: Number(tiltAngle),
      shadowFreeSpaceSqFt: Number(shadowFreeSpaceSqFt),
      cableDistanceMeters: Number(cableDistanceMeters),
      roofType,
      obstacles,
      sanctionLoadKw: Number(sanctionLoadKw),
      supplyType,
      approved: Boolean(approved),
      approvedCapacity: Number(approvedCapacity),
      inspectionNotes,
      photographs: photographs.length > 0 ? photographs : [
        'https://images.unsplash.com/photo-1508873696983-2df5293cb998?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=600&q=80'
      ],
      completedAt: new Date().toISOString()
    };

    const status = approved ? 'Completed' : 'Rejected';

    const updatedSurvey = await Survey.findByIdAndUpdate(
      req.params.id,
      {
        status,
        report
      },
      { new: true }
    );

    // Update enquiry status
    if (survey.enquiryId) {
      await Enquiry.findByIdAndUpdate(survey.enquiryId, {
        status: approved ? 'Survey Done' : 'Survey Rejected',
        proposedCapacity: Number(approvedCapacity)
      });
    }

    // Notify Sales team to generate quotation
    await Notification.create({
      role: 'Sales',
      title: approved ? 'Survey Approved - Ready for Quotation' : 'Survey Rejected',
      message: `${survey.customerName}'s roof survey is marked ${status}. Recommended capacity: ${approvedCapacity}kW.`,
      link: '/quotations',
      read: false
    });

    res.json({
      success: true,
      message: 'Survey report submitted successfully',
      survey: updatedSurvey
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  scheduleSurvey,
  getSurveys,
  getSurveyById,
  submitSurveyReport
};
