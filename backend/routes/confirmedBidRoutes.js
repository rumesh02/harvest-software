const express = require('express');
const router = express.Router();
const ConfirmedBid = require('../models/ConfirmedBid'); // Updated model

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
    console.error('Error fetching confirmed bid:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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

// GET pending payments for a merchant
router.get('/merchant/:merchantId/pending', async (req, res) => {
  try {
    const { merchantId } = req.params;
    console.log(`Fetching pending payments for merchant: ${merchantId}`);
    
    // Find confirmed bids that are not paid and belong to this merchant
    const pendingPayments = await ConfirmedBid.find({
      merchantId: merchantId,
      status: { $in: ['confirmed', 'processing'] } // Any status that's not 'paid' or 'canceled'
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${pendingPayments.length} pending payments`);
    res.json(pendingPayments);
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET completed payments for a merchant
router.get('/merchant/:merchantId/completed', async (req, res) => {
  try {
    const { merchantId } = req.params;
    console.log(`Fetching completed payments for merchant: ${merchantId}`);
    
    // Find confirmed bids that are paid and belong to this merchant
    const completedPayments = await ConfirmedBid.find({
      merchantId: merchantId,
      status: "paid" // Only paid orders
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${completedPayments.length} completed payments`);
    res.json(completedPayments);
  } catch (error) {
    console.error('Error fetching completed payments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update payment status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const confirmedBid = await ConfirmedBid.findById(id);
    if (!confirmedBid) {
      return res.status(404).json({ message: 'Confirmed bid not found' });
    }
    
    confirmedBid.status = status;
    
    // If there are additional payment details, add them
    if (req.body.paymentMethod) {
      confirmedBid.paymentMethod = req.body.paymentMethod;
    }
    
    if (req.body.paymentId) {
      confirmedBid.paymentId = req.body.paymentId;
    }
    
    // Add payment attempt if provided
    if (req.body.paymentAttempt) {
      confirmedBid.paymentAttempts.push({
        date: new Date(),
        ...req.body.paymentAttempt
      });
    }
    
    await confirmedBid.save();
    res.json(confirmedBid);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;