const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  dietPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DietPlan',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  calories: {
    type: Number,
    min: 0
  },
  protein: {
    type: Number,
    min: 0
  },
  carbs: {
    type: Number,
    min: 0
  },
  fat: {
    type: Number,
    min: 0
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  imageUrl: String
}, {
  timestamps: true
});

// Index for faster queries
mealSchema.index({ dietPlanId: 1 });
mealSchema.index({ mealType: 1 });

module.exports = mongoose.model('Meal', mealSchema);
