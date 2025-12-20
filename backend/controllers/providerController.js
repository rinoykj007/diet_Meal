const Provider = require('../models/Provider');
const User = require('../models/User');

// @desc    Get all active providers
// @route   GET /api/providers
// @access  Public
exports.getProviders = async (req, res) => {
  try {
    const providers = await Provider.find({ isActive: true }).populate('userId', 'email fullName');
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single provider
// @route   GET /api/providers/:id
// @access  Public
exports.getProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id).populate('userId', 'email fullName');

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create provider profile
// @route   POST /api/providers
// @access  Private
exports.createProvider = async (req, res) => {
  try {
    const { businessName, description, address, phone, logoUrl } = req.body;

    // Check if provider already exists
    const existingProvider = await Provider.findOne({ userId: req.user._id });
    if (existingProvider) {
      return res.status(400).json({ message: 'Provider profile already exists' });
    }

    // Add provider role to user
    const user = await User.findById(req.user._id);
    if (!user.roles.includes('provider')) {
      user.roles.push('provider');
      await user.save();
    }

    const provider = await Provider.create({
      userId: req.user._id,
      businessName,
      description,
      address,
      phone,
      logoUrl
    });

    res.status(201).json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update provider profile
// @route   PUT /api/providers/:id
// @access  Private (Provider or Admin)
exports.updateProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Check ownership
    if (provider.userId.toString() !== req.user._id.toString() && !req.user.roles.includes('admin')) {
      return res.status(403).json({ message: 'Not authorized to update this provider' });
    }

    const updatedProvider = await Provider.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedProvider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete provider
// @route   DELETE /api/providers/:id
// @access  Private (Provider or Admin)
exports.deleteProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Check ownership
    if (provider.userId.toString() !== req.user._id.toString() && !req.user.roles.includes('admin')) {
      return res.status(403).json({ message: 'Not authorized to delete this provider' });
    }

    await provider.deleteOne();
    res.json({ message: 'Provider removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
