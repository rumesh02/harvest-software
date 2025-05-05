const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenueController');  

// Get monthly revenue for a farmer
router.get('/farmer/:farmerId', revenueController.getMonthlyRevenue);

// GET total revenue (placeholder endpoint)
router.get('/', (req, res) => {
  res.json({ message: 'Revenue route is working' });
});

module.exports = router;
