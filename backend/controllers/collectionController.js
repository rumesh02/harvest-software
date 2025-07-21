const mongoose = require('mongoose');
const Collection = require('../models/CollectionModel');
const Product = require('../models/Product');
const User = require('../models/User');
const ConfirmedBid = require('../models/ConfirmedBid');

// Get all collections for a merchant
const getMerchantCollections = async (req, res) => {
  try {
    const { merchantId } = req.params;
    
    const collections = await Collection.find({ merchantId })
      .sort({ createdAt: -1 })
      .lean();
    
    // Populate farmer details for each collection if not already present
    const populatedCollections = await Promise.all(
      collections.map(async (collection) => {
        // If farmer details are missing or incomplete, fetch from User model
        if (!collection.farmerDetails || !collection.location?.farmerRegisteredAddress) {
          try {
            const farmerData = await User.findOne({ auth0Id: collection.farmerId });
            if (farmerData) {
              // Update farmer details
              if (!collection.farmerDetails) {
                collection.farmerDetails = {
                  name: farmerData.name,
                  phone: farmerData.phone,
                  rating: farmerData.farmerRatings || 0
                };
              }
              
              // Update farmer registered address
              if (!collection.location) {
                collection.location = {};
              }
              
              if (!collection.location.farmerRegisteredAddress) {
                collection.location.farmerRegisteredAddress = {
                  address: farmerData.address,
                  district: farmerData.district
                };
              }
              
              // Update display address if not present
              if (!collection.location.displayAddress) {
                if (collection.location.selectedLocation && collection.location.selectedLocation.address) {
                  collection.location.displayAddress = collection.location.selectedLocation.address;
                } else if (farmerData.address && farmerData.district) {
                  collection.location.displayAddress = `${farmerData.address}, ${farmerData.district}`;
                } else if (farmerData.address) {
                  collection.location.displayAddress = farmerData.address;
                } else if (farmerData.district) {
                  collection.location.displayAddress = farmerData.district;
                } else {
                  collection.location.displayAddress = 'Location not available';
                }
              }
            }
          } catch (error) {
            console.error('Error fetching farmer data for collection:', error);
          }
        }
        
        return collection;
      })
    );
    
    res.json(populatedCollections);
  } catch (error) {
    console.error('Error fetching merchant collections:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create collection from confirmed bid
const createCollectionFromConfirmedBid = async (req, res) => {
  try {
    const { confirmedBidId } = req.body;
    
    // Get confirmed bid data
    const confirmedBid = await ConfirmedBid.findById(confirmedBidId);
    if (!confirmedBid) {
      return res.status(404).json({ message: 'Confirmed bid not found' });
    }
    
    // Get product data for location information
    let productData = null;
    if (confirmedBid.items && confirmedBid.items.length > 0) {
      try {
        productData = await Product.findById(confirmedBid.items[0].productId);
      } catch (error) {
        console.log('Product not found, will use farmer registered address');
      }
    }
    
    // Get farmer data for fallback address
    const farmerData = await User.findOne({ auth0Id: confirmedBid.farmerId });
    if (!farmerData) {
      return res.status(404).json({ message: 'Farmer data not found' });
    }
    
    // Create collection using static method
    const collection = await Collection.createFromConfirmedBid(
      confirmedBid, 
      productData, 
      farmerData
    );
    
    // Save the collection
    await collection.save();
    
    res.status(201).json(collection);
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update collection status
const updateCollectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const collection = await Collection.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    res.json(collection);
  } catch (error) {
    console.error('Error updating collection status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update collection selection status
const updateCollectionSelection = async (req, res) => {
  try {
    const { id } = req.params;
    const { isSelected } = req.body;
    
    const collection = await Collection.findByIdAndUpdate(
      id,
      { 
        'collectionDetails.isSelected': isSelected,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    res.json(collection);
  } catch (error) {
    console.error('Error updating collection selection:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update transport details
const updateTransportDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { collectionMethod, transportDetails } = req.body;
    
    const updateData = {
      'collectionDetails.collectionMethod': collectionMethod,
      updatedAt: new Date()
    };
    
    if (transportDetails) {
      updateData['collectionDetails.transportDetails'] = transportDetails;
    }
    
    const collection = await Collection.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    res.json(collection);
  } catch (error) {
    console.error('Error updating transport details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get collection by ID
const getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    res.json(collection);
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Migrate existing confirmed bids to collections
const migrateConfirmedBidsToCollections = async (req, res) => {
  try {
    const confirmedBids = await ConfirmedBid.find();
    let migratedCount = 0;
    
    for (const confirmedBid of confirmedBids) {
      try {
        // Check if collection already exists
        const existingCollection = await Collection.findOne({ orderId: confirmedBid.orderId });
        if (existingCollection) {
          continue; // Skip if already migrated
        }
        
        // Get product data
        let productData = null;
        if (confirmedBid.items && confirmedBid.items.length > 0) {
          try {
            productData = await Product.findById(confirmedBid.items[0].productId);
          } catch (error) {
            console.log(`Product not found for bid ${confirmedBid.orderId}`);
          }
        }
        
        // Get farmer data
        const farmerData = await User.findOne({ auth0Id: confirmedBid.farmerId });
        if (!farmerData) {
          console.log(`Farmer not found for bid ${confirmedBid.orderId}`);
          continue;
        }
        
        // Create collection
        const collection = await Collection.createFromConfirmedBid(
          confirmedBid,
          productData,
          farmerData
        );
        
        await collection.save();
        migratedCount++;
        
      } catch (error) {
        console.error(`Error migrating bid ${confirmedBid.orderId}:`, error);
      }
    }
    
    res.json({ 
      message: `Successfully migrated ${migratedCount} confirmed bids to collections`,
      migratedCount
    });
  } catch (error) {
    console.error('Error during migration:', error);
    res.status(500).json({ message: 'Migration error', error: error.message });
  }
};

// Get farmer collections with bid details
const getFarmerCollections = async (req, res) => {
  try {
    const { farmerId } = req.params;
    console.log('Fetching collections for farmer:', farmerId);
    
    // Aggregate to get collections where the bid belongs to this farmer
    const collections = await Collection.aggregate([
      {
        $lookup: {
          from: 'confirmedbids',
          localField: 'bidId',
          foreignField: '_id',
          as: 'bidDetails'
        }
      },
      {
        $unwind: '$bidDetails'
      },
      {
        $match: {
          'bidDetails.farmerId': new mongoose.Types.ObjectId(farmerId)
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'bidDetails.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: '$productDetails'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'bidDetails.merchantId',
          foreignField: '_id',
          as: 'merchantDetails'
        }
      },
      {
        $unwind: '$merchantDetails'
      },
      {
        $project: {
          bidId: '$bidDetails._id',
          productName: '$productDetails.name',
          quantity: '$bidDetails.quantity',
          price: '$bidDetails.price',
          status: '$status',
          selectedForCollection: '$selectedForCollection',
          merchantName: '$merchantDetails.name',
          merchantEmail: '$merchantDetails.email',
          transportDetails: '$transportDetails',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt'
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    console.log(`Found ${collections.length} collections for farmer ${farmerId}`);
    res.json(collections);
  } catch (error) {
    console.error('Error fetching farmer collections:', error);
    res.status(500).json({ message: 'Error fetching collections', error: error.message });
  }
};

module.exports = {
  getMerchantCollections,
  getFarmerCollections,
  createCollectionFromConfirmedBid,
  updateCollectionStatus,
  updateCollectionSelection,
  updateTransportDetails,
  getCollectionById,
  migrateConfirmedBidsToCollections
};
