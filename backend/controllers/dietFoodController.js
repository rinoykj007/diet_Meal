const DietFood = require('../models/DietFood');
const Restaurant = require('../models/Restaurant');
const AIDietRecommendation = require('../models/AIDietRecommendation');
const AIDietPreference = require('../models/AIDietPreference');
const {
  calculateBMR,
  calculateTDEE,
  calculateMealBudgets,
  calculateMacroTargets,
  calculateMacroScore,
  matchesDietaryRestrictions,
  containsAllergens,
  generateMatchReasons,
  generateBadges
} = require('../utils/macroScoring');

// @desc    Get all diet foods (public)
// @route   GET /api/diet-foods
// @access  Public
exports.getDietFoods = async (req, res) => {
  try {
    const { restaurantId, dietType, search, minCalories, maxCalories, personalized, mealType } = req.query;

    let query = { isAvailable: true };

    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    if (dietType) {
      query.dietType = dietType;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Personalized filtering
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

        // Apply meal-specific calorie filtering
        if (mealBudgets && mealType && mealBudgets[mealType]) {
          query.calories = {
            $gte: mealBudgets[mealType].min,
            $lte: mealBudgets[mealType].max
          };
        }

        // Filter by dietary restrictions
        if (preferences.dietaryRestrictions && preferences.dietaryRestrictions.length > 0) {
          query.dietType = { $in: preferences.dietaryRestrictions };
        }

        // Exclude foods with allergens
        if (preferences.allergies && preferences.allergies.length > 0) {
          const allergiesLower = preferences.allergies.map(a => a.toLowerCase());
          query.$and = query.$and || [];
          allergiesLower.forEach(allergy => {
            query.$and.push({
              $or: [
                { allergens: { $exists: false } },
                { allergens: { $size: 0 } },
                { allergens: { $not: { $regex: allergy, $options: 'i' } } }
              ]
            });
          });
        }
      }
    } else if (minCalories || maxCalories) {
      // Manual calorie filtering (non-personalized)
      query.calories = {};
      if (minCalories) query.calories.$gte = Number(minCalories);
      if (maxCalories) query.calories.$lte = Number(maxCalories);
    }

    const dietFoods = await DietFood.find(query)
      .populate('restaurantId', 'name address image rating')
      .sort({ rating: -1, createdAt: -1 })
      .lean();

    // Add personalized metadata if personalized mode is on
    let enrichedFoods = dietFoods;
    if (personalized === 'true' && req.user) {
      const userId = req.user._id;
      const latestRecommendation = await AIDietRecommendation.findOne({ userId })
        .sort({ createdAt: -1 })
        .limit(1);
      const savedPreference = await AIDietPreference.findOne({ userId });
      const preferences = latestRecommendation?.preferences || savedPreference;

      if (preferences) {
        const bmr = calculateBMR({
          age: preferences.age,
          weight: preferences.weight,
          height: preferences.height,
          gender: preferences.gender
        });
        const tdee = calculateTDEE(bmr, preferences.activityLevel || 'moderate');
        const mealBudgets = calculateMealBudgets(tdee);
        const macroTargets = calculateMacroTargets(tdee, preferences.healthGoals || []);

        enrichedFoods = dietFoods.map(food => {
          const mealBudget = mealType && mealBudgets ? mealBudgets[mealType] : null;
          const calorieMatch = mealBudget
            ? food.calories >= mealBudget.min && food.calories <= mealBudget.max
            : true;

          const macroScore = calculateMacroScore(
            food,
            macroTargets,
            preferences.mealsPerDay || 3,
            preferences.healthGoals || []
          );

          const matchReasons = generateMatchReasons(
            food,
            mealBudget,
            macroScore,
            preferences.healthGoals || []
          );

          const badges = generateBadges(
            food,
            mealBudget,
            macroScore,
            preferences.healthGoals || []
          );

          return {
            ...food,
            personalized: {
              calorieMatch,
              macroScore,
              matchReasons,
              badges
            }
          };
        });

        // Sort by macro score (best matches first)
        enrichedFoods.sort((a, b) => b.personalized.macroScore - a.personalized.macroScore);
      }
    }

    res.json({
      success: true,
      count: enrichedFoods.length,
      data: enrichedFoods
    });
  } catch (error) {
    console.error('Error in getDietFoods:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single diet food by ID
// @route   GET /api/diet-foods/:id
// @access  Public
exports.getDietFoodById = async (req, res) => {
  try {
    const dietFood = await DietFood.findById(req.params.id)
      .populate('restaurantId', 'name description address phone email image rating');

    if (!dietFood) {
      return res.status(404).json({
        success: false,
        message: 'Diet food not found'
      });
    }

    res.json({
      success: true,
      data: dietFood
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new diet food item
// @route   POST /api/diet-foods
// @access  Private (restaurant owner)
exports.createDietFood = async (req, res) => {
  try {
    const {
      restaurantId,
      name,
      description,
      dietType,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      price,
      image,
      images,
      ingredients,
      allergens,
      servingSize,
      preparationTime
    } = req.body;

    // Verify restaurant exists and user is owner
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if user is restaurant owner
    if (restaurant.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add food to this restaurant'
      });
    }

    // Check if restaurant is approved
    if (!restaurant.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant must be approved before adding food items'
      });
    }

    const dietFood = await DietFood.create({
      restaurantId,
      name,
      description,
      dietType,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      price,
      image,
      images,
      ingredients,
      allergens,
      servingSize,
      preparationTime
    });

    const populatedDietFood = await DietFood.findById(dietFood._id)
      .populate('restaurantId', 'name address image');

    res.status(201).json({
      success: true,
      message: 'Diet food item created successfully',
      data: populatedDietFood
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update diet food item
// @route   PUT /api/diet-foods/:id
// @access  Private (restaurant owner)
exports.updateDietFood = async (req, res) => {
  try {
    const dietFood = await DietFood.findById(req.params.id);

    if (!dietFood) {
      return res.status(404).json({
        success: false,
        message: 'Diet food not found'
      });
    }

    // Verify user owns the restaurant
    const restaurant = await Restaurant.findById(dietFood.restaurantId);
    if (restaurant.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this food item'
      });
    }

    const {
      name,
      description,
      dietType,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      price,
      image,
      images,
      ingredients,
      allergens,
      servingSize,
      preparationTime,
      isAvailable
    } = req.body;

    // Update fields
    if (name) dietFood.name = name;
    if (description) dietFood.description = description;
    if (dietType) dietFood.dietType = dietType;
    if (calories !== undefined) dietFood.calories = calories;
    if (protein !== undefined) dietFood.protein = protein;
    if (carbs !== undefined) dietFood.carbs = carbs;
    if (fat !== undefined) dietFood.fat = fat;
    if (fiber !== undefined) dietFood.fiber = fiber;
    if (sugar !== undefined) dietFood.sugar = sugar;
    if (sodium !== undefined) dietFood.sodium = sodium;
    if (price !== undefined) dietFood.price = price;
    if (image) dietFood.image = image;
    if (images) dietFood.images = images;
    if (ingredients) dietFood.ingredients = ingredients;
    if (allergens) dietFood.allergens = allergens;
    if (servingSize) dietFood.servingSize = servingSize;
    if (preparationTime !== undefined) dietFood.preparationTime = preparationTime;
    if (typeof isAvailable === 'boolean') dietFood.isAvailable = isAvailable;

    await dietFood.save();

    const updatedDietFood = await DietFood.findById(dietFood._id)
      .populate('restaurantId', 'name address image');

    res.json({
      success: true,
      message: 'Diet food item updated successfully',
      data: updatedDietFood
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete diet food item
// @route   DELETE /api/diet-foods/:id
// @access  Private (restaurant owner)
exports.deleteDietFood = async (req, res) => {
  try {
    const dietFood = await DietFood.findById(req.params.id);

    if (!dietFood) {
      return res.status(404).json({
        success: false,
        message: 'Diet food not found'
      });
    }

    // Verify user owns the restaurant
    const restaurant = await Restaurant.findById(dietFood.restaurantId);
    if (restaurant.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this food item'
      });
    }

    await dietFood.deleteOne();

    res.json({
      success: true,
      message: 'Diet food item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get diet foods by restaurant
// @route   GET /api/restaurants/:restaurantId/diet-foods
// @access  Public
exports.getDietFoodsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { dietType } = req.query;

    let query = { restaurantId, isAvailable: true };

    if (dietType) {
      query.dietType = dietType;
    }

    const dietFoods = await DietFood.find(query)
      .sort({ rating: -1, name: 1 });

    res.json({
      success: true,
      count: dietFoods.length,
      data: dietFoods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
