const mongoose = require('mongoose');

const aiDietPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dietaryRestrictions: [String],
  healthGoals: [String],
  allergies: [String],
  preferredCuisines: [String],
  age: {
    type: Number,
    min: 1,
    max: 120
  },
  gender: {
    type: String,
    enum: ['male', 'female']
  },
  height: {
    type: Number,
    min: 50,
    max: 300
  },
  weight: {
    type: Number,
    min: 20,
    max: 500
  },
  calorieTarget: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
// Note: userId already has unique: true, so no need for separate index

module.exports = mongoose.model('AIDietPreference', aiDietPreferenceSchema);
