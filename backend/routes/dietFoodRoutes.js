const express = require('express');
const router = express.Router();
const {
  getDietFoods,
  getDietFoodById,
  createDietFood,
  updateDietFood,
  deleteDietFood,
  getDietFoodsByRestaurant
} = require('../controllers/dietFoodController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getDietFoods);
router.get('/:id', getDietFoodById);
router.get('/restaurant/:restaurantId', getDietFoodsByRestaurant);

// Protected routes (restaurant owners)
router.post('/', protect, createDietFood);
router.put('/:id', protect, updateDietFood);
router.delete('/:id', protect, deleteDietFood);

module.exports = router;
