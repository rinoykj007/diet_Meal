const Restaurant = require('../models/Restaurant');
const DietFood = require('../models/DietFood');
const AIDietRecommendation = require('../models/AIDietRecommendation');
const AIDietPreference = require('../models/AIDietPreference');
const {
  calculateBMR,
  calculateTDEE,
  calculateMealBudgets
} = require('../utils/macroScoring');

// @desc    Get all restaurants (public - approved only)
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res) => {
  try {
    const { dietType, search, personalized, mealType } = req.query;

    let query = { isApproved: true, isActive: true };

    if (dietType) {
      query.dietTypes = dietType;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const restaurants = await Restaurant.find(query)
      .populate('ownerId', 'fullName email')
      .sort({ rating: -1, createdAt: -1 })
      .lean();

    // If personalized mode, filter restaurants by food availability
    if (personalized === 'true' && req.user) {
      const userId = req.user._id;

      // Get user preferences
      const latestRecommendation = await AIDietRecommendation.findOne({ userId })
        .sort({ createdAt: -1 })
        .limit(1);
      const savedPreference = await AIDietPreference.findOne({ userId });
      const preferences = latestRecommendation?.preferences || savedPreference;

      if (preferences) {
        // Calculate BMR and TDEE
        const bmr = calculateBMR({
          age: preferences.age,
          weight: preferences.weight,
          height: preferences.height,
          gender: preferences.gender
        });
        const tdee = calculateTDEE(bmr, preferences.activityLevel || 'moderate');
        const mealBudgets = calculateMealBudgets(tdee);

        // Build food query based on user preferences
        let foodQuery = { isAvailable: true };

        // Apply meal-specific calorie filtering
        if (mealBudgets && mealType && mealBudgets[mealType]) {
          foodQuery.calories = {
            $gte: mealBudgets[mealType].min,
            $lte: mealBudgets[mealType].max
          };
        }

        // Filter by dietary restrictions
        if (preferences.dietaryRestrictions && preferences.dietaryRestrictions.length > 0) {
          foodQuery.dietType = { $in: preferences.dietaryRestrictions };
        }

        // Exclude foods with allergens
        if (preferences.allergies && preferences.allergies.length > 0) {
          const allergiesLower = preferences.allergies.map(a => a.toLowerCase());
          foodQuery.$and = foodQuery.$and || [];
          allergiesLower.forEach(allergy => {
            foodQuery.$and.push({
              $or: [
                { allergens: { $exists: false } },
                { allergens: { $size: 0 } },
                { allergens: { $not: { $regex: allergy, $options: 'i' } } }
              ]
            });
          });
        }

        // Get restaurants with matching foods
        const restaurantIds = restaurants.map(r => r._id);
        foodQuery.restaurantId = { $in: restaurantIds };

        const matchingFoods = await DietFood.find(foodQuery).select('restaurantId').lean();
        const restaurantsWithMatchingFoods = new Set(
          matchingFoods.map(f => f.restaurantId.toString())
        );

        // Count matching foods per restaurant
        const foodCounts = matchingFoods.reduce((acc, food) => {
          const restId = food.restaurantId.toString();
          acc[restId] = (acc[restId] || 0) + 1;
          return acc;
        }, {});

        // Filter and enrich restaurants
        const enrichedRestaurants = restaurants
          .filter(r => restaurantsWithMatchingFoods.has(r._id.toString()))
          .map(r => ({
            ...r,
            matchingFoodsCount: foodCounts[r._id.toString()] || 0
          }))
          .sort((a, b) => b.matchingFoodsCount - a.matchingFoodsCount);

        return res.json({
          success: true,
          count: enrichedRestaurants.length,
          data: enrichedRestaurants,
          personalized: true
        });
      }
    }

    res.json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    console.error('Error in getRestaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('ownerId', 'fullName email phone');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new restaurant
// @route   POST /api/restaurants
// @access  Private (authenticated users)
exports.createRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      dietTypes,
      address,
      phone,
      email,
      image
    } = req.body;

    // Check if user already has a restaurant
    const existingRestaurant = await Restaurant.findOne({ ownerId: req.user._id });
    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: 'You already have a restaurant registered'
      });
    }

    const restaurant = await Restaurant.create({
      name,
      description,
      dietTypes,
      ownerId: req.user._id,
      address,
      phone,
      email,
      image,
      isApproved: false // Needs admin approval
    });

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully. Awaiting admin approval.',
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (owner or admin)
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if user is owner or admin
    const isOwner = restaurant.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes('admin');

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this restaurant'
      });
    }

    const {
      name,
      description,
      dietTypes,
      address,
      phone,
      email,
      image,
      isActive
    } = req.body;

    // Update fields
    if (name) restaurant.name = name;
    if (description) restaurant.description = description;
    if (dietTypes) restaurant.dietTypes = dietTypes;
    if (address) restaurant.address = address;
    if (phone) restaurant.phone = phone;
    if (email) restaurant.email = email;
    if (image) restaurant.image = image;
    if (typeof isActive === 'boolean') restaurant.isActive = isActive;

    await restaurant.save();

    res.json({
      success: true,
      message: 'Restaurant updated successfully',
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (owner or admin)
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if user is owner or admin
    const isOwner = restaurant.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes('admin');

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this restaurant'
      });
    }

    await restaurant.deleteOne();

    res.json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Approve restaurant (admin only)
// @route   PUT /api/restaurants/:id/approve
// @access  Private (admin)
exports.approveRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    restaurant.isApproved = true;
    await restaurant.save();

    res.json({
      success: true,
      message: 'Restaurant approved successfully',
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my restaurant (owner)
// @route   GET /api/restaurants/my-restaurant
// @access  Private
exports.getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'You do not have a restaurant registered'
      });
    }

    res.json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get ALL restaurants (admin only - includes unapproved)
// @route   GET /api/restaurants/admin/all
// @access  Private (admin)
exports.getAllRestaurantsAdmin = async (req, res) => {
  try {
    const { isApproved, isActive, search } = req.query;

    let query = {};

    if (isApproved !== undefined) {
      query.isApproved = isApproved === 'true';
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const restaurants = await Restaurant.find(query)
      .populate('ownerId', 'fullName email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
