const express = require('express');
const router = express.Router();
const ConfirmedBid = require('../models/ConfirmedBid'); // Updated model

// POST - Create a new confirmed bid
router.post('/', async (req, res) => {
  try {
    console.log('Received confirmed bid data:', req.body);
    console.log('Items in request:', req.body.items);
    console.log('First item quantity:', req.body.items && req.body.items[0] ? req.body.items[0].quantity : 'No items');
    
    // Create a new confirmed bid document
    const newConfirmedBid = new ConfirmedBid(req.body);
    
    // Save to database
    const savedBid = await newConfirmedBid.save();
    console.log('Successfully created confirmed bid:', savedBid);
    console.log('Saved items:', savedBid.items);
    console.log('Saved first item quantity:', savedBid.items && savedBid.items[0] ? savedBid.items[0].quantity : 'No items');
    
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
    
    // Populate farmer details for each confirmed bid
    const User = require('../models/User');
    const Product = require('../models/Product');
    
    const populatedBids = await Promise.all(
      confirmedBids.map(async (bid) => {
        try {
          // Fetch farmer information
          const farmer = await User.findOne({ auth0Id: bid.farmerId });
          
          // Fetch product information for location data
          let productLocation = null;
          if (bid.items && bid.items.length > 0) {
            try {
              const product = await Product.findById(bid.items[0].productId);
              if (product && product.location) {
                productLocation = product.location;
              }
            } catch (productError) {
              console.log('Product not found for bid:', bid._id);
            }
          }
          
          // Create the response object with farmer details
          const bidObject = bid.toObject();
          
          if (farmer) {
            // Add farmer details
            bidObject.farmerName = farmer.name;
            bidObject.farmerPhone = farmer.phone;
            bidObject.farmerEmail = farmer.email;
            
            // Add farmer registered address for fallback
            bidObject.farmerRegisteredAddress = {
              address: farmer.address,
              district: farmer.district
            };
          }
          
          // Add product location if found
          if (productLocation) {
            bidObject.productLocation = productLocation;
          }
          
          return bidObject;
        } catch (error) {
          console.error(`Error populating details for bid ${bid._id}:`, error);
          return bid.toObject();
        }
      })
    );
    
    res.json(populatedBids);
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
    
    // Fetch farmer information and product images for each payment
    const User = require('../models/User');
    const Product = require('../models/Product');
    const paymentsWithCompleteInfo = await Promise.all(
      completedPayments.map(async (payment) => {
        try {
          // Fetch farmer information
          const farmer = await User.findOne({ auth0Id: payment.farmerId });
          
          // Fetch product image for the first item (or all items if needed)
          let productImage = null;
          if (payment.items && payment.items.length > 0) {
            const productId = payment.items[0].productId;
            if (productId) {
              try {
                const product = await Product.findById(productId);
                productImage = product ? product.image : null;
              } catch (productError) {
                console.error(`Error fetching product ${productId}:`, productError);
              }
            }
          }
            // Enhance items with product images
          const enhancedItems = await Promise.all(
            (payment.items || []).map(async (item) => {
              console.log(`Processing item:`, item); // Debug log
              console.log(`Item quantity:`, item.quantity); // Debug log for quantity
              
              let itemImage = null;
              if (item.productId) {
                try {
                  const product = await Product.findById(item.productId);
                  itemImage = product ? product.image : null;
                } catch (productError) {
                  console.error(`Error fetching product ${item.productId}:`, productError);
                }
              }
              
              // Fix: Properly spread all item properties and add imageUrl
              const enhancedItem = {
                productId: item.productId,
                name: item.name,
                quantity: item.quantity,  // Explicitly preserve quantity
                price: item.price,
                _id: item._id,
                imageUrl: itemImage
              };
              
              console.log(`Enhanced item:`, enhancedItem); // Debug log
              console.log(`Enhanced item quantity:`, enhancedItem.quantity); // Debug log
              
              return enhancedItem;
            })
          );
          
          return {
            ...payment.toObject(),
            farmerName: farmer ? farmer.name : 'Unknown Farmer',
            farmerPhone: farmer ? farmer.phone : 'N/A',
            farmerEmail: farmer ? farmer.email : 'N/A',
            items: enhancedItems
          };
        } catch (error) {
          console.error(`Error fetching complete info for payment ${payment._id}:`, error);
          return {
            ...payment.toObject(),
            farmerName: 'Unknown Farmer',
            farmerPhone: 'N/A',
            farmerEmail: 'N/A',
            items: payment.items || []
          };
        }
      })
    );
    
    res.json(paymentsWithCompleteInfo);
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