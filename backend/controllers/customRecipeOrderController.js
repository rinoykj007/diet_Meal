const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const Notification = require("../models/Notification");

// @desc    Create custom recipe order request
// @route   POST /api/orders/custom-recipe
// @access  Private
exports.createCustomRecipeOrder = async (req, res) => {
  try {
    const {
      restaurantId,
      recipeDetails,
      deliveryAddress,
      deliveryDate,
      notes,
    } = req.body;

    // Validate restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.isApproved || !restaurant.isActive) {
      return res.status(400).json({
        success: false,
        message: "Restaurant not available",
      });
    }

    // Validate recipe details
    if (!recipeDetails || !recipeDetails.recipeName) {
      return res.status(400).json({
        success: false,
        message: "Recipe details are required",
      });
    }

    // Create custom recipe order
    const order = await Order.create({
      userId: req.user._id,
      restaurantId,
      orderType: "diet-food",
      isCustomRecipe: true,
      recipeDetails,
      deliveryAddress,
      deliveryDate: deliveryDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: "pending",
      customPriceStatus: "pending-quote",
      paymentStatus: "pending",
      notes,
      items: [], // No menu items for custom recipe
      totalAmount: 0, // Will be set when price is quoted
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("restaurantId", "name address phone image")
      .populate("userId", "fullName email phone");

    // Create notification for restaurant
    await Notification.create({
      userId: restaurant.ownerId,
      title: "🍳 New Custom Recipe Request",
      message: `New custom recipe request for "${recipeDetails.recipeName}" from ${req.user.fullName}`,
      type: "info",
      category: "order",
      relatedOrderId: order._id,
      relatedRestaurantId: restaurant._id,
      actionUrl: `/restaurant/orders`,
    });

    res.status(201).json({
      success: true,
      message: "Custom recipe order request sent successfully",
      data: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Restaurant quotes price for custom recipe
// @route   PUT /api/orders/:id/quote-price
// @access  Private (restaurant owner)
exports.quoteRecipePrice = async (req, res) => {
  try {
    const { price } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid price is required",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.isCustomRecipe) {
      return res.status(400).json({
        success: false,
        message: "This is not a custom recipe order",
      });
    }

    // Verify user owns the restaurant
    const restaurant = await Restaurant.findById(order.restaurantId);
    if (
      !restaurant ||
      restaurant.ownerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to quote price for this order",
      });
    }

    if (order.customPriceStatus !== "pending-quote") {
      return res.status(400).json({
        success: false,
        message: "Cannot quote price for this order",
      });
    }

    order.quotedPrice = price;
    order.quotedAt = new Date();
    order.customPriceStatus = "quoted";
    await order.save();

    // Notify customer
    await Notification.create({
      userId: order.userId,
      title: "Price Quote Received",
      message: `${restaurant.name} has quoted $${price.toFixed(
        2
      )} for your custom recipe "${order.recipeDetails.recipeName}"`,
      type: "info",
      category: "order",
      relatedOrderId: order._id,
      relatedRestaurantId: restaurant._id,
      actionUrl: `/orders`,
    });

    const updatedOrder = await Order.findById(order._id)
      .populate("restaurantId", "name address phone image")
      .populate("userId", "fullName email phone");

    res.json({
      success: true,
      message: "Price quoted successfully",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    User accepts quoted price
// @route   PUT /api/orders/:id/accept-quote
// @access  Private
exports.acceptQuote = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (order.customPriceStatus !== "quoted") {
      return res.status(400).json({
        success: false,
        message: "No quote to accept",
      });
    }

    // AUTOMATIC ORDER PLACEMENT
    order.customPriceStatus = "accepted";
    order.status = "confirmed";
    order.totalAmount = order.quotedPrice;
    order.userAcceptedAt = new Date();
    await order.save();

    // Notify restaurant
    const restaurant = await Restaurant.findById(order.restaurantId);
    await Notification.create({
      userId: restaurant.ownerId,
      title: "Custom Recipe Order Confirmed",
      message: `Customer accepted your quote of $${order.quotedPrice.toFixed(
        2
      )} for "${order.recipeDetails.recipeName}"`,
      type: "success",
      category: "order",
      relatedOrderId: order._id,
      relatedRestaurantId: restaurant._id,
      actionUrl: `/restaurant/orders`,
    });

    const updatedOrder = await Order.findById(order._id)
      .populate("restaurantId", "name address phone image")
      .populate("userId", "fullName email phone");

    res.json({
      success: true,
      message: "Order placed successfully",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    User rejects quoted price
// @route   PUT /api/orders/:id/reject-quote
// @access  Private
exports.rejectQuote = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (order.customPriceStatus !== "quoted") {
      return res.status(400).json({
        success: false,
        message: "No quote to reject",
      });
    }

    order.customPriceStatus = "rejected";
    order.status = "cancelled";
    order.userRejectedAt = new Date();
    await order.save();

    // Notify restaurant
    const restaurant = await Restaurant.findById(order.restaurantId);
    await Notification.create({
      userId: restaurant.ownerId,
      title: " Quote Rejected",
      message: `Customer rejected your quote for "${order.recipeDetails.recipeName}"`,
      type: "warning",
      category: "order",
      relatedOrderId: order._id,
      relatedRestaurantId: restaurant._id,
      actionUrl: `/restaurant/orders`,
    });

    const updatedOrder = await Order.findById(order._id)
      .populate("restaurantId", "name address phone image")
      .populate("userId", "fullName email phone");

    res.json({
      success: true,
      message: "Quote rejected",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
