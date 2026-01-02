const express = require('express');
const router = express.Router();
const {
    createRequest,
    getAvailableRequests,
    acceptRequest,
    updateStatus,
    getMyRequests,
    getMyDeliveries,
    cancelRequest,
    confirmDelivery,
    disputeDelivery
} = require('../controllers/shoppingListRequestController');
const { protect, authorize } = require('../middleware/auth');

// Customer routes
router.post('/', protect, createRequest);
router.get('/my-requests', protect, getMyRequests);
router.put('/:id/cancel', protect, cancelRequest);
router.put('/:id/confirm-delivery', protect, confirmDelivery);
router.put('/:id/dispute-delivery', protect, disputeDelivery);

// Delivery partner routes
router.get('/available', protect, authorize('delivery-partner'), getAvailableRequests);
router.put('/:id/accept', protect, authorize('delivery-partner'), acceptRequest);
router.put('/:id/status', protect, authorize('delivery-partner'), updateStatus);
router.get('/my-deliveries', protect, authorize('delivery-partner'), getMyDeliveries);

module.exports = router;
