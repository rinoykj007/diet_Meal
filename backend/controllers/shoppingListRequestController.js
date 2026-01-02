const ShoppingListRequest = require('../models/ShoppingListRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create shopping list delivery request
// @route   POST /api/shopping-requests
// @access  Private
exports.createRequest = async (req, res) => {
    try {
        const { mealPlanId, items, deliveryAddress, estimatedCost, notes } = req.body;

        console.log('Shopping request data:', {
            userId: req.user?._id,
            mealPlanId,
            itemsCount: items?.length,
            deliveryAddress
        });

        // Validation
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Shopping list items are required'
            });
        }

        if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city) {
            return res.status(400).json({
                success: false,
                message: 'Complete delivery address is required'
            });
        }

        // Create request
        const request = await ShoppingListRequest.create({
            userId: req.user._id,
            mealPlanId,
            items,
            deliveryAddress,
            estimatedCost: estimatedCost || 0,
            notes,
            status: 'pending'
        });

        // Get all delivery partners
        const deliveryPartners = await User.find({
            roles: 'delivery-partner',
            isActive: { $ne: false }
        });

        // Notify all delivery partners
        for (const partner of deliveryPartners) {
            await Notification.create({
                userId: partner._id,
                title: '🛒 New Shopping List Request',
                message: `New shopping delivery request with ${items.length} items in ${deliveryAddress.city}`,
                type: 'info',
                category: 'shopping-request',
                actionUrl: '/delivery-partner/requests'
            });
        }

        const populatedRequest = await ShoppingListRequest.findById(request._id)
            .populate('userId', 'fullName email phone');

        res.status(201).json({
            success: true,
            message: 'Shopping list request created successfully',
            data: populatedRequest
        });
    } catch (error) {
        console.error('Create shopping request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Get available requests (for delivery partners)
// @route   GET /api/shopping-requests/available
// @access  Private (delivery partner)
exports.getAvailableRequests = async (req, res) => {
    try {
        const requests = await ShoppingListRequest.find({
            status: 'pending',
            deliveryPartnerId: null
        })
            .populate('userId', 'fullName email phone')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Accept shopping list request (First come first served)
// @route   PUT /api/shopping-requests/:id/accept
// @access  Private (delivery partner)
exports.acceptRequest = async (req, res) => {
    try {
        const request = await ShoppingListRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // First come first served - check if already accepted
        if (request.deliveryPartnerId) {
            return res.status(400).json({
                success: false,
                message: 'This request has already been accepted by another delivery partner'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'This request is no longer available'
            });
        }

        // Accept the request and auto-start shopping
        request.deliveryPartnerId = req.user._id;
        request.status = 'in-progress';
        request.acceptedAt = new Date();
        await request.save();

        // Notify customer
        await Notification.create({
            userId: request.userId,
            title: '🛒 Shopping Started',
            message: `${req.user.fullName} accepted your request and started shopping for your items`,
            type: 'success',
            category: 'shopping-request',
            actionUrl: '/shopping-requests'
        });

        const populatedRequest = await ShoppingListRequest.findById(request._id)
            .populate('userId', 'fullName email phone')
            .populate('deliveryPartnerId', 'fullName email phone');

        res.json({
            success: true,
            message: 'Request accepted successfully',
            data: populatedRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update delivery status
// @route   PUT /api/shopping-requests/:id/status
// @access  Private (delivery partner)
exports.updateStatus = async (req, res) => {
    try {
        const { status, finalCost } = req.body;

        const request = await ShoppingListRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Verify ownership
        if (request.deliveryPartnerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this request'
            });
        }

        const oldStatus = request.status;
        request.status = status;

        if (status === 'delivered') {
            request.deliveredAt = new Date();
            if (finalCost) {
                request.finalCost = finalCost;
            }
        }

        await request.save();

        // Notify customer about status change
        const statusMessages = {
            'in-progress': {
                title: '🛒 Shopping Started',
                message: 'Your delivery partner has started shopping for your items'
            },
            'delivered': {
                title: '🎉 Items Delivered',
                message: 'Your shopping items have been delivered. Please make payment to the delivery partner.'
            }
        };

        if (statusMessages[status] && oldStatus !== status) {
            await Notification.create({
                userId: request.userId,
                title: statusMessages[status].title,
                message: statusMessages[status].message,
                type: status === 'delivered' ? 'success' : 'info',
                category: 'shopping-request',
                actionUrl: '/shopping-requests'
            });
        }

        const populatedRequest = await ShoppingListRequest.findById(request._id)
            .populate('userId', 'fullName email phone')
            .populate('deliveryPartnerId', 'fullName email phone');

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: populatedRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get my shopping requests (for customers)
// @route   GET /api/shopping-requests/my-requests
// @access  Private
exports.getMyRequests = async (req, res) => {
    try {
        const { status } = req.query;

        let query = { userId: req.user._id };
        if (status) {
            // Support comma-separated status values
            const statusArray = status.split(',').map(s => s.trim());
            if (statusArray.length > 1) {
                query.status = { $in: statusArray };
            } else {
                query.status = status;
            }
        }

        const requests = await ShoppingListRequest.find(query)
            .populate('deliveryPartnerId', 'fullName email phone')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get my deliveries (for delivery partners)
// @route   GET /api/shopping-requests/my-deliveries
// @access  Private (delivery partner)
exports.getMyDeliveries = async (req, res) => {
    try {
        const { status } = req.query;

        let query = { deliveryPartnerId: req.user._id };
        if (status) {
            // Support comma-separated status values
            const statusArray = status.split(',').map(s => s.trim());
            if (statusArray.length > 1) {
                query.status = { $in: statusArray };
            } else {
                query.status = status;
            }
        }

        const deliveries = await ShoppingListRequest.find(query)
            .populate('userId', 'fullName email phone')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: deliveries.length,
            data: deliveries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Cancel shopping request
// @route   PUT /api/shopping-requests/:id/cancel
// @access  Private
exports.cancelRequest = async (req, res) => {
    try {
        const request = await ShoppingListRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Check if user owns this request
        if (request.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this request'
            });
        }

        // Can only cancel pending requests
        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Can only cancel pending requests'
            });
        }

        request.status = 'cancelled';
        request.cancelledAt = new Date();
        await request.save();

        res.json({
            success: true,
            message: 'Request cancelled successfully',
            data: request
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Confirm delivery received (Customer confirms they received the items)
// @route   PUT /api/shopping-requests/:id/confirm-delivery
// @access  Private (customer)
exports.confirmDelivery = async (req, res) => {
    try {
        const request = await ShoppingListRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Check if user owns this request
        if (request.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to confirm this delivery'
            });
        }

        // Can only confirm delivered requests
        if (request.status !== 'delivered') {
            return res.status(400).json({
                success: false,
                message: 'Can only confirm delivered requests'
            });
        }

        // Keep status as delivered, just mark as confirmed
        request.deliveryConfirmed = true;
        request.deliveryConfirmedAt = new Date();
        request.paymentStatus = 'paid';
        await request.save();

        // Notify delivery partner
        if (request.deliveryPartnerId) {
            await Notification.create({
                userId: request.deliveryPartnerId,
                title: '✅ Delivery Confirmed',
                message: `Customer confirmed receipt of shopping list delivery. Payment completed.`,
                type: 'success',
                category: 'shopping-request',
                actionUrl: '/delivery-partner/deliveries'
            });
        }

        const populatedRequest = await ShoppingListRequest.findById(request._id)
            .populate('userId', 'fullName email phone')
            .populate('deliveryPartnerId', 'fullName email phone');

        res.json({
            success: true,
            message: 'Delivery confirmed successfully',
            data: populatedRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Report delivery issue/dispute (Customer didn't receive or has issues)
// @route   PUT /api/shopping-requests/:id/dispute-delivery
// @access  Private (customer)
exports.disputeDelivery = async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a reason for the dispute'
            });
        }

        const request = await ShoppingListRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Check if user owns this request
        if (request.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to dispute this delivery'
            });
        }

        // Can only dispute delivered requests
        if (request.status !== 'delivered') {
            return res.status(400).json({
                success: false,
                message: 'Can only dispute delivered requests'
            });
        }

        // Update status to disputed
        request.status = 'disputed';
        request.deliveryDisputed = true;
        request.disputeReason = reason;
        request.disputedAt = new Date();
        await request.save();

        // Notify delivery partner about dispute
        if (request.deliveryPartnerId) {
            await Notification.create({
                userId: request.deliveryPartnerId,
                title: '⚠️ Delivery Disputed',
                message: `Customer reported an issue with delivery: ${reason}`,
                type: 'warning',
                category: 'shopping-request',
                actionUrl: '/delivery-partner/deliveries'
            });
        }

        const populatedRequest = await ShoppingListRequest.findById(request._id)
            .populate('userId', 'fullName email phone')
            .populate('deliveryPartnerId', 'fullName email phone');

        res.json({
            success: true,
            message: 'Delivery dispute reported successfully',
            data: populatedRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
