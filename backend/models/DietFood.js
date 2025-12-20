const mongoose = require('mongoose');

const dietFoodSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required']
  },
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dietType: {
    type: String,
    enum: ['keto', 'vegan', 'vegetarian', 'diabetic', 'low-carb', 'high-protein', 'gluten-free', 'paleo', 'mediterranean'],
    required: [true, 'Diet type is required']
  },
  // Nutritional Information
  calories: {
    type: Number,
    required: [true, 'Calories are required'],
    min: 0
  },
  protein: {
    type: Number,
    required: [true, 'Protein content is required'],
    min: 0
  },
  carbs: {
    type: Number,
    required: [true, 'Carbohydrates content is required'],
    min: 0
  },
  fat: {
    type: Number,
    required: [true, 'Fat content is required'],
    min: 0
  },
  fiber: {
    type: Number,
    min: 0,
    default: 0
  },
  sugar: {
    type: Number,
    min: 0,
    default: 0
  },
  sodium: {
    type: Number,
    min: 0,
    default: 0
  },
  // Pricing
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  // Media
  image: String,
  images: [String],
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  // Additional Info
  ingredients: [String],
  allergens: [String],
  servingSize: String,
  preparationTime: Number, // in minutes
  // Ratings
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for faster queries
dietFoodSchema.index({ restaurantId: 1 });
dietFoodSchema.index({ dietType: 1 });
dietFoodSchema.index({ isAvailable: 1 });
dietFoodSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('DietFood', dietFoodSchema);
