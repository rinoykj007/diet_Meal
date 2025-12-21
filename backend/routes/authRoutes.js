const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login, getMe, updateProfile, getAllUsers, updateUserRole, resetUserPassword } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    session: false
  }),
  (req, res) => {
    console.log('=== Google OAuth Callback ===');
    console.log('User authenticated:', req.user);
    console.log('User ID:', req.user?._id);
    console.log('FRONTEND_URL env:', process.env.FRONTEND_URL);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('JWT_EXPIRE:', process.env.JWT_EXPIRE);

    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    console.log('Generated token:', token);

    const redirectUrl = `${process.env.FRONTEND_URL}/auth/google/success?token=${token}`;
    console.log('Redirecting to:', redirectUrl);

    // Redirect to frontend with token
    res.redirect(redirectUrl);
  }
);

// Admin only routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.put('/users/:id/password', protect, authorize('admin'), resetUserPassword);

module.exports = router;
