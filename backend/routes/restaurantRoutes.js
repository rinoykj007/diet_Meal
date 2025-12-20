const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  approveRestaurant,
  getMyRestaurant,
  getAllRestaurantsAdmin
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/auth');

// Admin only routes (must come before general routes to avoid conflicts)
router.get('/admin/all', protect, authorize('admin'), getAllRestaurantsAdmin);
router.put('/:id/approve', protect, authorize('admin'), approveRestaurant);

// Public routes
router.get('/', getRestaurants);

// Protected routes (specific routes must come before parameterized routes)
router.get('/my/restaurant', protect, getMyRestaurant);
router.post('/', protect, createRestaurant);
router.put('/:id', protect, updateRestaurant);
router.delete('/:id', protect, deleteRestaurant);

// Parameterized route (must come last)
router.get('/:id', getRestaurantById);

module.exports = router;
