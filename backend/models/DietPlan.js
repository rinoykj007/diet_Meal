const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  durationDays: {
    type: Number,
    default: 7,
    min: 1
  },
  caloriesPerDay: {
    type: Number,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
dietPlanSchema.index({ providerId: 1 });
dietPlanSchema.index({ isActive: 1 });
dietPlanSchema.index({ price: 1 });

module.exports = mongoose.model('DietPlan', dietPlanSchema);
