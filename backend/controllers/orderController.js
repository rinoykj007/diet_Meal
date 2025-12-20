const Order = require('../models/Order');
const DietFood = require('../models/DietFood');
const Restaurant = require('../models/Restaurant');
const Notification = require('../models/Notification');

// @desc    Create new order (diet food)
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      restaurantId,
      items, // Array of { dietFoodId, quantity }
      deliveryAddress,
      deliveryDate,
      paymentMethod,
      notes
    } = req.body;

    // Validate restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.isApproved || !restaurant.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant not available'
      });
    }

    // Process items and calculate total
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const dietFood = await DietFood.findById(item.dietFoodId);

      if (!dietFood || !dietFood.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Food item ${item.dietFoodId} is not available`
        });
      }

      if (dietFood.restaurantId.toString() !== restaurantId) {
        return res.status(400).json({
          success: false,
          message: 'All items must be from the same restaurant'
        });
      }

      const quantity = item.quantity || 1;
      const subtotal = dietFood.price * quantity;
      totalAmount += subtotal;

      orderItems.push({
        dietFoodId: dietFood._id,
        name: dietFood.name,
        quantity,
        price: dietFood.price,
        subtotal
      });
    }

    // Create order
    const order = await Order.create({
      userId: req.user._id,
      restaurantId,
      items: orderItems,
      orderType: 'diet-food',
      deliveryAddress,
      deliveryDate: deliveryDate || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default: tomorrow
      totalAmount,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
      notes
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('restaurantId', 'name address phone image')
      .populate('items.dietFoodId', 'name image calories protein carbs fat');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all orders (for current user)
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const { status, orderType } = req.query;

    let query = { userId: req.user._id };

    if (status) {
      query.status = status;
    }

    if (orderType) {
      query.orderType = orderType;
    }

    const orders = await Order.find(query)
      .populate('restaurantId', 'name address phone image')
      .populate('items.dietFoodId', 'name image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurantId', 'name description address phone email image')
      .populate('items.dietFoodId', 'name description image calories protein carbs fat price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (restaurant owner or admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is restaurant owner or admin
    if (order.restaurantId) {
      const restaurant = await Restaurant.findById(order.restaurantId);
      const isOwner = restaurant && restaurant.ownerId.toString() === req.user._id.toString();
      const isAdmin = req.user.roles.includes('admin');

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this order'
        });
      }
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Create notification for customer when status changes
    const restaurant = await Restaurant.findById(order.restaurantId);
    const notificationMessages = {
      confirmed: {
        title: '✅ Order Confirmed!',
        message: `Your order from ${restaurant.name} has been confirmed and is being prepared.`,
        type: 'success'
      },
      preparing: {
        title: '👨‍🍳 Order is Being Prepared',
        message: `Your order from ${restaurant.name} is now being prepared.`,
        type: 'info'
      },
      'out-for-delivery': {
        title: '🚚 Order Out for Delivery',
        message: `Your order from ${restaurant.name} is on its way!`,
        type: 'info'
      },
      delivered: {
        title: '🎉 Order Delivered',
        message: `Your order from ${restaurant.name} has been delivered. Enjoy your meal!`,
        type: 'success'
      },
      cancelled: {
        title: '❌ Order Cancelled',
        message: `Your order from ${restaurant.name} has been cancelled.`,
        type: 'warning'
      }
    };

    if (notificationMessages[status] && oldStatus !== status) {
      await Notification.create({
        userId: order.userId,
        title: notificationMessages[status].title,
        message: notificationMessages[status].message,
        type: notificationMessages[status].type,
        category: 'order',
        relatedOrderId: order._id,
        relatedRestaurantId: restaurant._id,
        actionUrl: `/orders`
      });
    }

    const updatedOrder = await Order.findById(order._id)
      .populate('restaurantId', 'name address phone')
      .populate('items.dietFoodId', 'name image');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order in current status'
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get orders for restaurant owner
// @route   GET /api/orders/restaurant/:restaurantId
// @access  Private (restaurant owner)
exports.getRestaurantOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { status } = req.query;

    // Verify user owns the restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || restaurant.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these orders'
      });
    }

    let query = { restaurantId };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('userId', 'fullName email phone')
      .populate('items.dietFoodId', 'name image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all orders (admin only)
// @route   GET /api/orders/all
// @access  Private (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, orderType } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (orderType) {
      query.orderType = orderType;
    }

    const orders = await Order.find(query)
      .populate('userId', 'fullName email phone')
      .populate('restaurantId', 'name address')
      .populate('items.dietFoodId', 'name image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
