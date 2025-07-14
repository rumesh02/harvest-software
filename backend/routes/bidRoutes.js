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

// Get all confirmed bids for the current user (merchant)
router.get("/confirmed", async (req, res) => {
  try {
    // If you have authentication, filter by merchant/user ID as well
    // const merchantId = req.user.id;
    // const bids = await Bid.find({ status: "Confirmed", merchant: merchantId });

    const bids = await bids.find({ status: "Confirmed" });
    res.json(bids);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
