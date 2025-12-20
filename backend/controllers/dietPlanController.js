const DietPlan = require('../models/DietPlan');
const Provider = require('../models/Provider');

// @desc    Get all active diet plans
// @route   GET /api/diet-plans
// @access  Public
exports.getDietPlans = async (req, res) => {
  try {
    const { providerId, minPrice, maxPrice } = req.query;
    const query = { isActive: true };

    if (providerId) query.providerId = providerId;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const dietPlans = await DietPlan.find(query).populate('providerId', 'businessName logoUrl');
    res.json(dietPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single diet plan
// @route   GET /api/diet-plans/:id
// @access  Public
exports.getDietPlan = async (req, res) => {
  try {
    const dietPlan = await DietPlan.findById(req.params.id).populate('providerId', 'businessName logoUrl description');

    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    res.json(dietPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create diet plan
// @route   POST /api/diet-plans
// @access  Private (Provider)
exports.createDietPlan = async (req, res) => {
  try {
    // Get provider for current user
    const provider = await Provider.findOne({ userId: req.user._id });

    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const dietPlan = await DietPlan.create({
      ...req.body,
      providerId: provider._id
    });

    res.status(201).json(dietPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update diet plan
// @route   PUT /api/diet-plans/:id
// @access  Private (Provider or Admin)
exports.updateDietPlan = async (req, res) => {
  try {
    const dietPlan = await DietPlan.findById(req.params.id).populate('providerId');

    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    // Check ownership
    if (dietPlan.providerId.userId.toString() !== req.user._id.toString() && !req.user.roles.includes('admin')) {
      return res.status(403).json({ message: 'Not authorized to update this diet plan' });
    }

    const updatedDietPlan = await DietPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedDietPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete diet plan
// @route   DELETE /api/diet-plans/:id
// @access  Private (Provider or Admin)
exports.deleteDietPlan = async (req, res) => {
  try {
    const dietPlan = await DietPlan.findById(req.params.id).populate('providerId');

    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    // Check ownership
    if (dietPlan.providerId.userId.toString() !== req.user._id.toString() && !req.user.roles.includes('admin')) {
      return res.status(403).json({ message: 'Not authorized to delete this diet plan' });
    }

    await dietPlan.deleteOne();
    res.json({ message: 'Diet plan removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
