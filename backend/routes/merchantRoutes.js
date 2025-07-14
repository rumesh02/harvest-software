const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');

// Test route to verify routing is working
router.get('/test', (req, res) => {
  res.json({ message: 'Merchant routes are working!' });
});

router.get('/dashboard/:userSub', merchantController.getDashboardData);

module.exports = router;