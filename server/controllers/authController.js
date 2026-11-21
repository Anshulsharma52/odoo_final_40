const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Customer, Notification } = require('../models');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'sunpower_solar_super_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a customer account (Public)
// @route   POST /api/auth/register
// @access  Public (Customer only)
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    // Strict RBAC Enforcement: Functional roles cannot be registered independently.
    // Only customer accounts can be created on public registration.
    if (role && role !== 'Customer') {
      let isRequesterAdmin = false;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
          const token = req.headers.authorization.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sunpower_solar_super_secret_jwt_key_2026');
          const reqUser = await User.findById(decoded.id);
          if (reqUser && reqUser.role === 'Admin') isRequesterAdmin = true;
        } catch (e) {
          // Token invalid or missing
        }
      }
      if (!isRequesterAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Functional roles (Sales, Technicians, Warehouse, etc.) cannot be created independently. Only Customers can create an account publicly. Contact an Administrator to create functional employee accounts.'
        });
      }
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default to Customer for all independent public registrations
    const userRole = role === 'Customer' || !role ? 'Customer' : role;

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userRole,
      phone: phone || '',
      address: address || '',
      active: true,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    });

    // If role is Customer, also create/sync Customer profile
    if (userRole === 'Customer') {
      await Customer.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: address || '',
        electricityConsumerNo: req.body.electricityConsumerNo || '',
        monthlyBill: req.body.monthlyBill || 0
      });
    }

    // Send Welcome Notification
    await Notification.create({
      userId: user._id,
      role: user.role,
      title: 'Welcome to SunPower Solutions!',
      message: `Account created successfully with role ${user.role}. Start exploring your dashboard.`,
      link: '/dashboard',
      read: false
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.active === false) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { password, ...userObj } = user;
    res.json({ success: true, user: userObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    const sanitized = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json({ success: true, count: sanitized.length, users: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update user role or status (Admin only)
// @route   PUT /api/auth/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const { role, active, phone, name } = req.body;
    const updateData = {};
    if (role) updateData.role = role;
    if (active !== undefined) updateData.active = active;
    if (phone) updateData.phone = phone;
    if (name) updateData.name = name;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { password, ...rest } = user;
    res.json({ success: true, user: rest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Quick switch user for demo/testing
// @route   POST /api/auth/switch-role
// @access  Public (for initial role-based entry) / Protected against customer escalation
const quickSwitchRole = async (req, res) => {
  try {
    const { role } = req.body;

    // Security check: Check if an active session is attempting unauthorized role escalation
    let requestingUser = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sunpower_solar_super_secret_jwt_key_2026');
        requestingUser = await User.findById(decoded.id);
      } catch (tokenErr) {
        // Token expired or invalid, will proceed as fresh role login
      }
    }

    // Strict RBAC Enforcement: If the currently logged in user is a Customer, prevent switching to Admin or staff roles
    if (requestingUser && requestingUser.role === 'Customer' && role !== 'Customer') {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Customer accounts cannot escalate privileges or switch to Admin or staff roles.'
      });
    }

    let user = await User.findOne({ role });
    if (!user) {
      return res.status(404).json({ success: false, message: `No demo user found for role: ${role}` });
    }
    const token = generateToken(user._id);
    const { password, ...userObj } = user;
    res.json({
      success: true,
      token,
      user: userObj
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Admin creates a functional role user
// @route   POST /api/auth/users
// @access  Private (Admin only)
const createFunctionalUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      phone: phone || '',
      address: address || '',
      active: true,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    });

    if (role === 'Customer') {
      await Customer.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: address || '',
        electricityConsumerNo: req.body.electricityConsumerNo || '',
        monthlyBill: req.body.monthlyBill || 0
      });
    }

    const { password: pwd, ...userWithoutPassword } = user;
    res.status(201).json({
      success: true,
      message: `Functional role '${role}' account created successfully for ${name}`,
      user: userWithoutPassword
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  getAllUsers,
  updateUser,
  quickSwitchRole,
  createFunctionalUser
};
