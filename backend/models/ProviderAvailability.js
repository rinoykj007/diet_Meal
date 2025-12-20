const mongoose = require('mongoose');

const providerAvailabilitySchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  unavailableDate: {
    type: Date,
    required: true
  },
  reason: String
}, {
  timestamps: true
});

// Index for faster queries
providerAvailabilitySchema.index({ providerId: 1 });
providerAvailabilitySchema.index({ unavailableDate: 1 });

module.exports = mongoose.model('ProviderAvailability', providerAvailabilitySchema);
