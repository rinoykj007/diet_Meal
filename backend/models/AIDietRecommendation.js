const mongoose = require('mongoose');

const aiDietRecommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // User inputs
  preferences: {
    dietaryRestrictions: [String],
    healthGoals: [String],
    allergies: [String],
    preferredCuisines: [String],
    age: Number,
    gender: {
      type: String,
      enum: ['male', 'female']
    },
    height: Number,
    weight: Number,
    calorieTarget: Number,
    mealsPerDay: {
      type: Number,
      default: 3
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'moderate'
    },
    budgetRange: String,
    additionalNotes: String
  },
  // AI-generated content
  recommendation: {
    summary: String,
    weeklyPlan: [{
      day: String,
      meals: [{
        mealType: String, // breakfast, lunch, dinner, snack
        name: String,
        description: String,
        calories: Number,
        macros: {
          protein: Number,
          carbs: Number,
          fats: Number
        },
        ingredients: [String],
        instructions: String
      }]
    }],
    nutritionalAnalysis: String,
    shoppingList: [String],
    tips: [String]
  },
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String
}, {
  timestamps: true
});

// Index for faster queries
aiDietRecommendationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AIDietRecommendation', aiDietRecommendationSchema);
