const express = require('express');
const { createBid, acceptBid, rejectBid, getBids, updateBidStatus } = require('../controllers/bidController');

const router = express.Router();

// GET: Fetch all bids
router.get("/", getBids);

// POST: Create a new bid
router.post("/", createBid);

// PUT: Accept/Reject bid routes
router.put('/accept/:bidId', acceptBid);
router.put('/reject/:bidId', rejectBid);
router.put('/status/:bidId', updateBidStatus);

module.exports = router;
