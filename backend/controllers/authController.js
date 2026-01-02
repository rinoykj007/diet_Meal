const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Provider = require('../models/Provider');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, fullName, phone, roles } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      fullName,
      phone,
      roles: roles && roles.length > 0 ? roles : ['user']
    });

    // Auto-create Restaurant document if user has restaurant role
    if (user.roles.includes('restaurant')) {
      const existingRestaurant = await Restaurant.findOne({ ownerId: user._id });
      if (!existingRestaurant) {
        await Restaurant.create({
          name: `${user.fullName}'s Restaurant`,
          description: 'Please update your restaurant details',
          dietTypes: [],
          ownerId: user._id,
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          location: {
            type: 'Point',
            coordinates: [0, 0]
          },
          isApproved: false,
          isActive: true
        });
        console.log(`Auto-created Restaurant document for user ${user.email}`);
      }
    }

    // Auto-create Provider document if user has delivery-partner role
    if (user.roles.includes('delivery-partner')) {
      const existingProvider = await Provider.findOne({ userId: user._id });
      if (!existingProvider) {
        await Provider.create({
          userId: user._id,
          businessName: `${user.fullName}'s Delivery Service`,
          description: 'Please update your delivery service details',
          address: '',
          phone: '',
          isActive: true
        });
        console.log(`Auto-created Provider document for user ${user.email}`);
      }
    }

    res.status(201).json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.phone = req.body.phone || user.phone;
      user.avatarUrl = req.body.avatarUrl || user.avatarUrl;

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/auth/users
// @access  Private (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user role (admin only)
// @route   PUT /api/auth/users/:id/role
// @access  Private (admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { roles } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate roles array
    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Roles must be a non-empty array'
      });
    }

    user.roles = roles;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reset user password (admin only)
// @route   PUT /api/auth/users/:id/password
// @access  Private (admin)
exports.resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
