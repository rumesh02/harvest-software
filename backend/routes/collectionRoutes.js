const express = require("express");
const router = express.Router();
const Purchase = require("../models/purchaseModel"); // or your order model

// Get all purchases/orders for the merchant
router.get("/", async (req, res) => {
  try {
    // Optionally filter by merchant ID if needed
    // const merchantId = req.user.id; // if using authentication
    // const purchases = await Purchase.find({ merchant: merchantId });

    const purchases = await Purchase.find(); // get all purchases
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/collect", async (req, res) => {
  try {
    const { orderIds } = req.body; // array of order IDs
    await Purchase.updateMany(
      { _id: { $in: orderIds }, status: { $ne: "Delivered" } },
      { $set: { status: "Collected" } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;