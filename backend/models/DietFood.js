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
    min: [50, 'Calories must be at least 50'],
    max: [2000, 'Calories cannot exceed 2000']
  },
  protein: {
    type: Number,
    required: [true, 'Protein content is required'],
    min: [0, 'Protein cannot be negative'],
    max: [150, 'Protein cannot exceed 150g']
  },
  carbs: {
    type: Number,
    required: [true, 'Carbohydrates content is required'],
    min: [0, 'Carbs cannot be negative'],
    max: [300, 'Carbs cannot exceed 300g']
  },
  fat: {
    type: Number,
    required: [true, 'Fat content is required'],
    min: [0, 'Fat cannot be negative'],
    max: [100, 'Fat cannot exceed 100g']
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

// Validate macro consistency before saving
dietFoodSchema.pre('save', function(next) {
  // Calculate calories from macros using standard conversion:
  // Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
  const calculatedCalories = (this.protein * 4) + (this.carbs * 4) + (this.fat * 9);

  // Allow 10% tolerance for rounding and measurement variations
  const tolerance = 0.10;
  const minCalories = calculatedCalories * (1 - tolerance);
  const maxCalories = calculatedCalories * (1 + tolerance);

  // Check if stated calories fall within acceptable range
  if (this.calories < minCalories || this.calories > maxCalories) {
    const error = new Error(
      `Macro inconsistency: Based on protein (${this.protein}g), carbs (${this.carbs}g), ` +
      `and fat (${this.fat}g), calculated calories are ${Math.round(calculatedCalories)}. ` +
      `Stated calories (${this.calories}) must be within ±10% (${Math.round(minCalories)}-${Math.round(maxCalories)}).`
    );
    error.name = 'ValidationError';
    return next(error);
  }

  next();
});

// Indexes for faster queries
dietFoodSchema.index({ restaurantId: 1 });
dietFoodSchema.index({ dietType: 1 });
dietFoodSchema.index({ isAvailable: 1 });
dietFoodSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('DietFood', dietFoodSchema);
