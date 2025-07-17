const express = require('express');
const router = express.Router();
const ConfirmedBid = require('../models/ConfirmedBid'); // Updated model
const { MongoClient, ObjectId } = require('mongodb');
const axios = require('axios');

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/harvest-sw";

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

// GET - Get all confirmed bids (for general use like farmer order tracking)
router.get('/', async (req, res) => {
  try {
    const confirmedBids = await ConfirmedBid.find({});
    res.json(confirmedBids);
  } catch (error) {
    console.error('Error fetching all confirmed bids:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET - Get all confirmed bids for a merchant
router.get('/merchant/:merchantId', async (req, res) => {
  try {
    const confirmedBids = await ConfirmedBid.find({ merchantId: req.params.merchantId });
    
    // Populate farmer details for each confirmed bid
    const User = require('../models/User');
    const Product = require('../models/Product');
    
    const populatedBids = await Promise.all(
      confirmedBids.map(async (bid) => {
        const bidObj = bid.toObject();
        
        try {
          // Fetch farmer details
          const farmerData = await User.findOne({ auth0Id: bid.farmerId });
          if (farmerData) {
            bidObj.farmerDetails = {
              name: farmerData.name,
              phone: farmerData.phone,
              rating: farmerData.farmerRatings || 0
            };
            
            // Add farmer registered address for location fallback
            bidObj.farmerRegisteredAddress = {
              address: farmerData.address,
              district: farmerData.district
            };
          }
          
          // Fetch product details for location if available
          if (bid.items && bid.items.length > 0) {
            const productData = await Product.findById(bid.items[0].productId);
            if (productData && productData.location) {
              bidObj.productLocation = {
                coordinates: productData.location.coordinates,
                address: productData.location.address,
                farmerAddress: farmerData?.address,
                farmerDistrict: farmerData?.district
              };
            }
          }
        } catch (error) {
          console.error('Error fetching farmer/product data for bid:', error);
        }
        
        return bidObj;
      })
    );
    
    res.json(populatedBids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Get all confirmed bids for a farmer
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const confirmedBids = await ConfirmedBid.find({ farmerId: req.params.farmerId });
    res.json(confirmedBids);
  } catch (error) {
    console.error('Error fetching farmer confirmed bids:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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

    // If payment is completed (status is 'paid'), also update the original bid status
    if (status === 'paid' && confirmedBid.bidId) {
      try {
        const client = await MongoClient.connect(uri);
        const db = client.db("harvest-sw");
        const bidsCollection = db.collection("bids");
        
        await bidsCollection.updateOne(
          { _id: new ObjectId(confirmedBid.bidId) },
          { 
            $set: { 
              status: "Paid",
              updatedAt: new Date()
            } 
          }
        );
        
        client.close();
        console.log(`Updated original bid ${confirmedBid.bidId} status to Paid`);
      } catch (bidUpdateError) {
        console.error('Error updating original bid status:', bidUpdateError);
        // Don't fail the main request if bid update fails
      }
    }
    
    res.json(confirmedBid);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST - Save transport choice
router.post('/transport-choice', async (req, res) => {
  try {
    const { orderId, transportSelected } = req.body;
    const bid = await ConfirmedBid.findOne({ orderId });
    if (!bid) {
      return res.status(404).json({ message: "Order not found" });
    }
    bid.transportSelected = transportSelected;
    await bid.save();
    res.json({ success: true, transportSelected });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Mark bids as paid
router.post('/mark-paid', async (req, res) => {
  try {
    const { orderIds, paymentDetails } = req.body;
    
    // Find and update the bids
    const updatedBids = await ConfirmedBid.updateMany(
      { orderId: { $in: orderIds } },
      {
        $set: {
          status: 'paid',
          paymentMethod: paymentDetails.method,
          paymentId: paymentDetails.id,
          paidAt: new Date()
        }
      }
    );
    
    // Notify each confirmedBidId
    for (const confirmedBidId of orderIds) {
      await axios.post("/api/confirmedbids/mark-paid", { confirmedBidId });
    }
    
    res.json({ success: true, updatedBids });
  } catch (error) {
    console.error('Error marking bids as paid:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/mark-paid', async (req, res) => {
  const { confirmedBidId } = req.body;
  try {
    const bid = await ConfirmedBid.findByIdAndUpdate(
      confirmedBidId,
      { status: "Paid" },
      { new: true }
    );
    if (!bid) return res.status(404).json({ message: "Bid not found" });
    res.json({ success: true, bid });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;