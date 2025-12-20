const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getRestaurantOrders,
  getAllOrders
} = require('../controllers/orderController');
const {
  createCustomRecipeOrder,
  quoteRecipePrice,
  acceptQuote,
  rejectQuote
} = require('../controllers/customRecipeOrderController');
const { protect, authorize } = require('../middleware/auth');

// Admin routes (must come first to avoid conflicts)
router.get('/all', protect, authorize('admin'), getAllOrders);

// Custom Recipe Routes (must come before /:id routes)
router.post('/custom-recipe', protect, createCustomRecipeOrder);
router.put('/:id/quote-price', protect, quoteRecipePrice);
router.put('/:id/accept-quote', protect, acceptQuote);
router.put('/:id/reject-quote', protect, rejectQuote);

// All other routes are protected (require authentication)
router.post('/', protect, createOrder);
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.get('/restaurant/:restaurantId', protect, getRestaurantOrders);

module.exports = router;
