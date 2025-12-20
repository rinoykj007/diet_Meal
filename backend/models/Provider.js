const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  address: String,
  phone: String,
  logoUrl: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
providerSchema.index({ userId: 1 });
providerSchema.index({ isActive: 1 });

module.exports = mongoose.model('Provider', providerSchema);
