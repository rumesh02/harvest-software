const express = require('express');
const router = express.Router();
const {
  updateUserLocation,
  getUserLocation,
  getNearbyUsers,
  getProductsByLocation
} = require('../controllers/locationController');

// Update user location
router.put('/users/:userId/location', updateUserLocation);

// Get user location
router.get('/users/:userId/location', getUserLocation);

// Get nearby users
router.get('/nearby-users', getNearbyUsers);

// Get products by location
router.get('/products/nearby', getProductsByLocation);

module.exports = router;
