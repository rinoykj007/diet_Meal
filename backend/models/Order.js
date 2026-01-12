const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  dietFoodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DietFood',
    required: false 
  },
  name: String,
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // For diet food orders
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  },
  items: [orderItemSchema],
  // For subscription-based orders (legacy)
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  orderType: {
    type: String,
    enum: ['diet-food', 'subscription'],
    default: 'diet-food'
  },
  deliveryDate: Date,
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  totalAmount: {
    type: Number,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'wallet']
  },
  notes: String,

  // Custom Recipe Order Fields
  isCustomRecipe: {
    type: Boolean,
    default: false
  },
  recipeDetails: {
    recipeName: String,
    description: String,
    ingredients: [String],
    instructions: String,
    calories: Number,
    macros: {
      protein: Number,
      carbs: Number,
      fats: Number
    },
    mealType: String  // breakfast, lunch, dinner
  },
  customPriceStatus: {
    type: String,
    enum: ['pending-quote', 'quoted', 'accepted', 'rejected'],
    default: null
  },
  quotedPrice: {
    type: Number,
    min: 0
  },
  quotedAt: Date,
  userAcceptedAt: Date,
  userRejectedAt: Date
}, {
  timestamps: true
});

// Index for faster queries
orderSchema.index({ userId: 1 });
orderSchema.index({ restaurantId: 1 });
orderSchema.index({ providerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderType: 1 });
orderSchema.index({ deliveryDate: 1 });

module.exports = mongoose.model('Order', orderSchema);
