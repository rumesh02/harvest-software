const express = require('express');
const { getBids, acceptBid, rejectBid } = require('../controllers/bidController'); // Import the controller functions

const router = express.Router();

// GET: Fetch all bids for a particular harvestId
router.get('/bids/:harvestId', getBids);  // Use the getBids controller function

// PUT: Accept a specific bid by bidId
router.put('/bids/accept/:bidId', acceptBid);  // Use the acceptBid controller function

// PUT: Reject a specific bid by bidId
router.put('/bids/reject/:bidId', rejectBid);  // Use the rejectBid controller function

module.exports = router;
