const express = require('express');
const router = express.Router();
const {
  getMerchantCollections,
  createCollectionFromConfirmedBid,
  updateCollectionStatus,
  updateCollectionSelection,
  updateTransportDetails,
  getCollectionById,
  migrateConfirmedBidsToCollections
} = require('../controllers/collectionController');

// GET /api/collections/merchant/:merchantId - Get all collections for a merchant
router.get('/merchant/:merchantId', getMerchantCollections);

// GET /api/collections/:id - Get collection by ID
router.get('/:id', getCollectionById);

// POST /api/collections - Create collection from confirmed bid
router.post('/', createCollectionFromConfirmedBid);

// PUT /api/collections/:id/status - Update collection status
router.put('/:id/status', updateCollectionStatus);

// PUT /api/collections/:id/selection - Update collection selection
router.put('/:id/selection', updateCollectionSelection);

// PUT /api/collections/:id/transport - Update transport details
router.put('/:id/transport', updateTransportDetails);

// POST /api/collections/migrate - Migrate existing confirmed bids to collections
router.post('/migrate', migrateConfirmedBidsToCollections);

// Legacy routes for backward compatibility
const Purchase = require("../models/purchaseModel"); // or your order model

// Get all purchases/orders for the merchant (legacy)
router.get("/legacy", async (req, res) => {
  try {
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