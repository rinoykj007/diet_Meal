const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, getAllUsers, updateUserRole, resetUserPassword } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Admin only routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.put('/users/:id/password', protect, authorize('admin'), resetUserPassword);

module.exports = router;
