const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dietPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DietPlan'
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date
}, {
  timestamps: true
});

// Index for faster queries
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ providerId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
