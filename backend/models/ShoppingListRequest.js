const mongoose = require('mongoose');

const shoppingListRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mealPlanId: {
        type: mongoose.Schema.Types.ObjectId
    },
    items: [{
        type: String,
        required: true
    }],
    deliveryAddress: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            default: 'USA'
        }
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in-progress', 'delivered', 'cancelled'],
        default: 'pending'
    },
    deliveryPartnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    deliveryFee: {
        type: Number,
        default: 10.00  // Fixed delivery fee
    },
    estimatedCost: {
        type: Number,
        default: 0
    },
    finalCost: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cash-on-delivery'],
        default: 'cash-on-delivery'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    notes: String,
    requestedAt: {
        type: Date,
        default: Date.now
    },
    acceptedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date
}, {
    timestamps: true
});

// Indexes for faster queries
shoppingListRequestSchema.index({ userId: 1 });
shoppingListRequestSchema.index({ deliveryPartnerId: 1 });
shoppingListRequestSchema.index({ status: 1 });
shoppingListRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ShoppingListRequest', shoppingListRequestSchema);
