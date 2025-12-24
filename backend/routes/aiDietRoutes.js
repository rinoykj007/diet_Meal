const express = require('express');
const router = express.Router();
const {
  generateDietRecommendation,
  getMyRecommendations,
  getRecommendation,
  rateRecommendation,
  deleteRecommendation,
  getUserPreferences,
  saveUserPreferences
} = require('../controllers/aiDietController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Generate new AI diet recommendation
router.post('/generate', generateDietRecommendation);

// Get user's recommendations
router.get('/my-recommendations', getMyRecommendations);

// Get or save user preferences
router.route('/preferences')
  .get(getUserPreferences)
  .post(saveUserPreferences);

// Get, rate, or delete specific recommendation
router.route('/:id')
  .get(getRecommendation)
  .delete(deleteRecommendation);

router.put('/:id/rate', rateRecommendation);

module.exports = router;
