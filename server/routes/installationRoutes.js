const express = require('express');
const router = express.Router();
const {
  getInstallations,
  getInstallationById,
  startInstallation,
  completeInstallation
} = require('../controllers/installationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getInstallations);
router.get('/:id', protect, getInstallationById);
router.put('/:id/start', protect, authorize('Admin', 'Director', 'Technician', 'Field Technician', 'Installation Technician', 'Survey Technician'), startInstallation);
router.post('/:id/complete', protect, authorize('Admin', 'Director', 'Technician', 'Field Technician', 'Installation Technician', 'Survey Technician'), completeInstallation);

module.exports = router;
