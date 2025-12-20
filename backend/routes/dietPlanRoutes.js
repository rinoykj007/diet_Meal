const express = require('express');
const router = express.Router();
const {
  getDietPlans,
  getDietPlan,
  createDietPlan,
  updateDietPlan,
  deleteDietPlan
} = require('../controllers/dietPlanController');
const { protect, isProvider } = require('../middleware/auth');

router.route('/')
  .get(getDietPlans)
  .post(protect, isProvider, createDietPlan);

router.route('/:id')
  .get(getDietPlan)
  .put(protect, updateDietPlan)
  .delete(protect, deleteDietPlan);

module.exports = router;
