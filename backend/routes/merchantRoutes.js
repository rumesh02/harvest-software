const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');

// Change the route to use decoded parameters
router.get('/api/merchant/dashboard/:userSub', (req, res, next) => {
  // Decode the userSub parameter
  req.params.userSub = decodeURIComponent(req.params.userSub);
  next();
}, merchantController.getDashboardData);

module.exports = router;