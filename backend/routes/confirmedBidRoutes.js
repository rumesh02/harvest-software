const express = require('express');
const router = express.Router();
const ConfirmedBid = require('../models/Order'); // Using your existing Order model

// POST - Create a new confirmed bid
router.post('/', async (req, res) => {
  try {
    console.log('Received confirmed bid data:', req.body);
    
    // Create a new confirmed bid document
    const newConfirmedBid = new ConfirmedBid(req.body);
    
    // Save to database
    const savedBid = await newConfirmedBid.save();
    console.log('Successfully created confirmed bid:', savedBid);
    
    // Return the created bid with its ID
    res.status(201).json(savedBid);
  } catch (error) {
    console.error('Error creating confirmed bid:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET - Get confirmed bid by ID
router.get('/:id', async (req, res) => {
  try {
    const confirmedBid = await ConfirmedBid.findById(req.params.id);
    if (!confirmedBid) {
      return res.status(404).json({ message: 'Confirmed bid not found' });
    }
    res.json(confirmedBid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Get all confirmed bids for a merchant
router.get('/merchant/:merchantId', async (req, res) => {
  try {
    const confirmedBids = await ConfirmedBid.find({ merchantId: req.params.merchantId });
    res.json(confirmedBids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change this route path to match what your frontend expects
router.get('/merchant/:merchantId/pending', async (req, res) => {
  try {
    const { merchantId } = req.params;
    console.log(`Fetching pending payments for merchant: ${merchantId}`);
    
    // Find confirmed bids with no associated payment
    const pendingPayments = await ConfirmedBid.find({ 
      merchantId: merchantId,
      status: 'confirmed', // This is correct, "confirmed" orders that need payment
      paymentId: { $exists: false } // No payment record exists
    }).sort({ createdAt: -1 }); // Newest first
    
    console.log(`Found ${pendingPayments.length} pending payments`);
    res.json(pendingPayments);
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;