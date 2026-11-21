const express = require('express');
const router = express.Router();
const { scheduleSurvey, getSurveys, getSurveyById, submitSurveyReport } = require('../controllers/surveyController');
const { protect, authorize } = require('../middleware/auth');

router.post('/schedule', protect, authorize('Admin', 'Sales'), scheduleSurvey);
router.get('/', protect, getSurveys);
router.get('/:id', protect, getSurveyById);
router.post('/:id/report', protect, authorize('Admin', 'Director', 'Technician', 'Field Technician', 'Survey Technician', 'Installation Technician'), submitSurveyReport);

module.exports = router;
