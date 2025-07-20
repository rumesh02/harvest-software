const express = require('express');
const router = express.Router();
const { getFarmerDashboard, getTopBuyers } = require('../controllers/farmerDashboardController');

// Get monthly revenue for a farmer
router.get('/api/revenue/farmer/:farmerId', getFarmerDashboard);

// Get top buyers (merchants) for a farmer
router.get('/api/farmers/:farmerId/top-buyers', getTopBuyers);

module.exports = router;
