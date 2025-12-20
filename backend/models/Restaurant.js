const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dietTypes: [{
    type: String,
    enum: ['keto', 'vegan', 'vegetarian', 'diabetic', 'low-carb', 'high-protein', 'gluten-free', 'paleo', 'mediterranean'],
  }],
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  image: String,
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
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

// Index for faster queries
restaurantSchema.index({ name: 1 });
restaurantSchema.index({ dietTypes: 1 });
restaurantSchema.index({ isApproved: 1, isActive: 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
