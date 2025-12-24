/**
 * Macro Scoring Utility
 * Calculates how well a food item matches user's health goals and nutritional targets
 */

/**
 * Calculate BMR using Harris-Benedict Equation
 * @param {Object} params - User parameters
 * @param {number} params.age - Age in years
 * @param {number} params.weight - Weight in kg
 * @param {number} params.height - Height in cm
 * @param {string} params.gender - 'male' or 'female'
 * @returns {number} BMR in calories
 */
const calculateBMR = ({ age, weight, height, gender }) => {
  if (!age || !weight || !height || !gender) {
    return null;
  }

  let bmr = 0;

  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else if (gender === 'female') {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }

  return Math.round(bmr);
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Activity level
 * @returns {number} TDEE in calories
 */
const calculateTDEE = (bmr, activityLevel = 'moderate') => {
  if (!bmr) return null;

  const activityFactors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const factor = activityFactors[activityLevel] || 1.55;
  return Math.round(bmr * factor);
};

/**
 * Calculate meal budgets based on TDEE
 * Distribution: Breakfast 25%, Lunch 35%, Dinner 30%, Snacks 10%
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {number} tolerance - Calorie tolerance (+/-) for each meal
 * @returns {Object} Meal budgets with min/max/target
 */
const calculateMealBudgets = (tdee, tolerance = 100) => {
  if (!tdee) return null;

  const distribution = {
    breakfast: 0.25,
    lunch: 0.35,
    dinner: 0.30,
    snacks: 0.10
  };

  const mealBudgets = {};

  for (const [meal, percentage] of Object.entries(distribution)) {
    const target = Math.round(tdee * percentage);
    mealBudgets[meal] = {
      target,
      min: target - tolerance,
      max: target + tolerance
    };
  }

  return mealBudgets;
};

/**
 * Calculate macro targets based on health goals
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {Array<string>} healthGoals - User's health goals
 * @returns {Object} Macro targets (protein, carbs, fats in grams)
 */
const calculateMacroTargets = (tdee, healthGoals = []) => {
  if (!tdee) return null;

  const goals = healthGoals.map(g => g.toLowerCase());

  // Default balanced macros (moderate carb)
  let proteinPercent = 0.30; // 30% of calories from protein
  let carbsPercent = 0.40;   // 40% of calories from carbs
  let fatsPercent = 0.30;    // 30% of calories from fats

  // Adjust based on health goals
  if (goals.some(g => g.includes('muscle') || g.includes('gain'))) {
    // High protein for muscle gain
    proteinPercent = 0.35;
    carbsPercent = 0.40;
    fatsPercent = 0.25;
  } else if (goals.some(g => g.includes('weight loss') || g.includes('fat loss'))) {
    // Higher protein, lower carbs for weight loss
    proteinPercent = 0.35;
    carbsPercent = 0.30;
    fatsPercent = 0.35;
  } else if (goals.some(g => g.includes('keto') || g.includes('low carb'))) {
    // Very low carb, high fat for keto
    proteinPercent = 0.25;
    carbsPercent = 0.05;
    fatsPercent = 0.70;
  }

  // Convert percentages to grams
  // Protein: 4 cal/g, Carbs: 4 cal/g, Fats: 9 cal/g
  const protein = Math.round((tdee * proteinPercent) / 4);
  const carbs = Math.round((tdee * carbsPercent) / 4);
  const fats = Math.round((tdee * fatsPercent) / 9);

  return {
    protein: { min: Math.round(protein * 0.8), ideal: protein, max: Math.round(protein * 1.2) },
    carbs: { min: Math.round(carbs * 0.8), ideal: carbs, max: Math.round(carbs * 1.2) },
    fats: { min: Math.round(fats * 0.8), ideal: fats, max: Math.round(fats * 1.2) }
  };
};

/**
 * Calculate macro score for a food item based on user goals
 * @param {Object} food - Food item with macros
 * @param {Object} macroTargets - User's macro targets (daily)
 * @param {number} mealsPerDay - Number of meals per day
 * @param {Array<string>} healthGoals - User's health goals
 * @returns {number} Score from 0-100
 */
const calculateMacroScore = (food, macroTargets, mealsPerDay = 3, healthGoals = []) => {
  if (!macroTargets) return 50; // Neutral score if no targets

  // Convert daily targets to per-meal targets
  const perMealTargets = {
    protein: {
      min: Math.round(macroTargets.protein.min / mealsPerDay),
      ideal: Math.round(macroTargets.protein.ideal / mealsPerDay),
      max: Math.round(macroTargets.protein.max / mealsPerDay)
    },
    carbs: {
      min: Math.round(macroTargets.carbs.min / mealsPerDay),
      ideal: Math.round(macroTargets.carbs.ideal / mealsPerDay),
      max: Math.round(macroTargets.carbs.max / mealsPerDay)
    },
    fats: {
      min: Math.round(macroTargets.fats.min / mealsPerDay),
      ideal: Math.round(macroTargets.fats.ideal / mealsPerDay),
      max: Math.round(macroTargets.fats.max / mealsPerDay)
    }
  };

  const goals = healthGoals.map(g => g.toLowerCase());

  // Calculate individual macro scores
  const proteinScore = scoreMacro(food.protein, perMealTargets.protein);
  const carbsScore = scoreMacro(food.carbs, perMealTargets.carbs);
  const fatsScore = scoreMacro(food.fat, perMealTargets.fats);

  // Weight scores based on health goals
  let proteinWeight = 0.33;
  let carbsWeight = 0.33;
  let fatsWeight = 0.34;

  if (goals.some(g => g.includes('muscle') || g.includes('gain'))) {
    proteinWeight = 0.50;
    carbsWeight = 0.30;
    fatsWeight = 0.20;
  } else if (goals.some(g => g.includes('weight loss') || g.includes('fat loss'))) {
    proteinWeight = 0.45;
    carbsWeight = 0.25;
    fatsWeight = 0.30;
  } else if (goals.some(g => g.includes('keto') || g.includes('low carb'))) {
    proteinWeight = 0.25;
    carbsWeight = 0.10; // Penalize high carbs heavily
    fatsWeight = 0.65;
  }

  const finalScore = (
    proteinScore * proteinWeight +
    carbsScore * carbsWeight +
    fatsScore * fatsWeight
  );

  return Math.round(finalScore);
};

/**
 * Score a single macro nutrient
 * @param {number} value - Actual value in food
 * @param {Object} target - Target with min/ideal/max
 * @returns {number} Score from 0-100
 */
const scoreMacro = (value, target) => {
  if (!value || !target) return 50;

  const { min, ideal, max } = target;

  // Perfect score if at ideal value
  if (value === ideal) return 100;

  // Good score if within range
  if (value >= min && value <= max) {
    // Calculate how close to ideal (80-100 range)
    const distanceFromIdeal = Math.abs(value - ideal);
    const rangeSize = (max - min) / 2;
    const score = 100 - (distanceFromIdeal / rangeSize) * 20;
    return Math.max(80, Math.min(100, score));
  }

  // Moderate score if slightly outside range
  if (value < min) {
    const deficit = min - value;
    const score = Math.max(0, 80 - (deficit / min) * 80);
    return score;
  }

  if (value > max) {
    const excess = value - max;
    const score = Math.max(0, 80 - (excess / max) * 80);
    return score;
  }

  return 50;
};

/**
 * Check if food matches user's dietary restrictions
 * @param {string} foodDietType - Food's diet type
 * @param {Array<string>} userRestrictions - User's dietary restrictions
 * @returns {boolean} True if food matches restrictions
 */
const matchesDietaryRestrictions = (foodDietType, userRestrictions) => {
  if (!userRestrictions || userRestrictions.length === 0) return true;

  const restrictions = userRestrictions.map(r => r.toLowerCase());
  const dietType = foodDietType.toLowerCase();

  // Check if food's diet type is in user's restrictions
  return restrictions.includes(dietType);
};

/**
 * Check if food contains allergens
 * @param {Array<string>} foodAllergens - Food's allergens
 * @param {Array<string>} userAllergies - User's allergies
 * @returns {boolean} True if food contains allergens
 */
const containsAllergens = (foodAllergens = [], userAllergies = []) => {
  if (!userAllergies || userAllergies.length === 0) return false;

  const allergies = userAllergies.map(a => a.toLowerCase());
  const allergens = foodAllergens.map(a => a.toLowerCase());

  // Check if any user allergy is in food allergens
  return allergies.some(allergy => allergens.some(allergen => allergen.includes(allergy)));
};

/**
 * Generate match reasons for why a food is recommended
 * @param {Object} food - Food item
 * @param {Object} mealBudget - Meal budget with min/max/target
 * @param {number} macroScore - Calculated macro score
 * @param {Array<string>} healthGoals - User's health goals
 * @returns {Array<string>} Array of match reasons
 */
const generateMatchReasons = (food, mealBudget, macroScore, healthGoals = []) => {
  const reasons = [];
  const goals = healthGoals.map(g => g.toLowerCase());

  // Calorie match
  if (mealBudget && food.calories >= mealBudget.min && food.calories <= mealBudget.max) {
    reasons.push(`Fits meal budget (${food.calories}/${mealBudget.target} cal)`);
  }

  // High protein
  if (food.protein >= 30) {
    reasons.push('High protein');
  }

  // Low carb
  if (food.carbs <= 20) {
    reasons.push('Low carb');
  }

  // Macro score
  if (macroScore >= 80) {
    reasons.push('Excellent macro balance');
  } else if (macroScore >= 60) {
    reasons.push('Good macro balance');
  }

  // Goal-specific
  if (goals.some(g => g.includes('muscle') || g.includes('gain')) && food.protein >= 35) {
    reasons.push('Great for muscle building');
  }

  if (goals.some(g => g.includes('weight loss') || g.includes('fat loss')) && food.calories < (mealBudget?.target || 600)) {
    reasons.push('Supports weight loss goal');
  }

  return reasons;
};

/**
 * Generate badges for food item
 * @param {Object} food - Food item
 * @param {Object} mealBudget - Meal budget with min/max/target
 * @param {number} macroScore - Calculated macro score
 * @param {Array<string>} healthGoals - User's health goals
 * @returns {Array<string>} Array of badge identifiers
 */
const generateBadges = (food, mealBudget, macroScore, healthGoals = []) => {
  const badges = [];

  // Calorie badges
  if (mealBudget) {
    if (food.calories >= mealBudget.min && food.calories <= mealBudget.max) {
      badges.push('optimal_calories');
    } else if (food.calories < mealBudget.min) {
      badges.push('low_calories');
    } else if (food.calories > mealBudget.max * 1.1) {
      badges.push('high_calories');
    }
  }

  // Macro badges
  if (food.protein >= 30) badges.push('high_protein');
  if (food.carbs <= 20) badges.push('low_carb');
  if (food.fat <= 10) badges.push('low_fat');

  // Diet type badges
  const dietType = food.dietType?.toLowerCase();
  if (dietType === 'keto') badges.push('keto_friendly');
  if (dietType === 'vegan') badges.push('vegan');
  if (dietType === 'vegetarian') badges.push('vegetarian');
  if (dietType === 'gluten-free') badges.push('gluten_free');

  return badges;
};

module.exports = {
  calculateBMR,
  calculateTDEE,
  calculateMealBudgets,
  calculateMacroTargets,
  calculateMacroScore,
  matchesDietaryRestrictions,
  containsAllergens,
  generateMatchReasons,
  generateBadges
};
