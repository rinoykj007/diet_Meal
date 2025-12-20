const express = require('express');
const router = express.Router();
const {
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider
} = require('../controllers/providerController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getProviders)
  .post(protect, createProvider);

router.route('/:id')
  .get(getProvider)
  .put(protect, updateProvider)
  .delete(protect, deleteProvider);

module.exports = router;
