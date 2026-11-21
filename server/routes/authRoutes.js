const express = require('express');
const router = express.Router();
const { register, login, getMe, getAllUsers, updateUser, quickSwitchRole, createFunctionalUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/switch-role', quickSwitchRole); // Quick switcher for demonstration
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('Admin'), getAllUsers);
router.post('/users', protect, authorize('Admin'), createFunctionalUser); // Only Admin can create functional roles
router.put('/users/:id', protect, authorize('Admin'), updateUser); // Only Admin can approve/update user roles

module.exports = router;
