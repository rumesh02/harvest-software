const express = require('express');
const router = express.Router();
const { getFarmerDashboard } = require('../controllers/farmerDashboardController');

// Get monthly revenue for a farmer
router.get('/api/revenue/farmer/:farmerId', getFarmerDashboard);

module.exports = router;
