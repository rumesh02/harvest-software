const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenueController');

// Get monthly revenue for a farmer
router.get('/farmer/:farmerId', revenueController.getMonthlyRevenue);

module.exports = router;