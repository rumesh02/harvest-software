const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Bid = require('../models/Bid');
const ConfirmedBid = require('../models/ConfirmedBid');
const Booking = require('../models/bookingModel');
const Product = require('../models/Product');
const adminAuth = require('../middleware/adminAuth');

// Update user roles to lowercase
router.get('/update-user-roles', async (req, res) => {
  try {
    await User.updateMany({ role: "Farmer" }, { $set: { role: "farmer" } });
    await User.updateMany({ role: "Merchant" }, { $set: { role: "merchant" } });
    await User.updateMany({ role: "Transporter" }, { $set: { role: "transporter" } });
    res.json({ message: "User roles updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user roles" });
  }
});

router.get('/user-counts', async (req, res) => {
  try {
    const farmers = await User.countDocuments({ role: "farmer" });
    const merchants = await User.countDocuments({ role: "merchant" });
    const transporters = await User.countDocuments({ role: "transporter" });
    res.json({ farmers, merchants, transporters });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user counts" });
  }
});

// Get basic analytics data - PUBLIC ROUTE (like user-counts)
router.get('/analytics-basic', async (req, res) => {
  try {
    console.log('🔍 Analytics endpoint called...');
    
    // Basic platform statistics
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } }); // Exclude admin users
    const totalListings = await Product.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalConfirmedBids = await ConfirmedBid.countDocuments();
    
    console.log('📊 Platform stats fetched:', { totalUsers, totalListings, totalBookings, totalConfirmedBids });
    
    // Top performing farmers based on confirmed bids
    const topFarmersAgg = await ConfirmedBid.aggregate([
      {
        $group: {
          _id: '$farmerId',
          successfulTransactions: { $sum: 1 },
          totalValue: { $sum: '$amount' }
        }
      },
      { $sort: { successfulTransactions: -1 } },
      { $limit: 5 }
    ]);

    console.log('👨‍🌾 Top farmers aggregation result:', topFarmersAgg);

    // Get farmer details
    const farmerIds = topFarmersAgg.map(f => f._id);
    const farmersData = await User.find({
      auth0Id: { $in: farmerIds }, 
      role: 'farmer'
    }).select('auth0Id name');

    const topFarmers = topFarmersAgg.map(farmer => {
      const farmerInfo = farmersData.find(f => f.auth0Id === farmer._id);
      return {
        _id: farmer._id,
        name: farmerInfo ? farmerInfo.name : 'Unknown Farmer',
        role: 'farmer',
        successfulTransactions: farmer.successfulTransactions,
        totalValue: farmer.totalValue,
        averageRating: 4.5 // Default rating for now
      };
    });

    console.log('👨‍🌾 Final top farmers:', topFarmers);

    // Top performing merchants based on confirmed bids
    const topMerchantsAgg = await ConfirmedBid.aggregate([
      {
        $group: {
          _id: '$merchantId',
          successfulTransactions: { $sum: 1 },
          totalValue: { $sum: '$amount' }
        }
      },
      { $sort: { successfulTransactions: -1 } },
      { $limit: 5 }
    ]);

    // Get merchant details
    const merchantIds = topMerchantsAgg.map(m => m._id);
    const merchantsData = await User.find({
      auth0Id: { $in: merchantIds }, 
      role: 'merchant'
    }).select('auth0Id name');

    const topMerchants = topMerchantsAgg.map(merchant => {
      const merchantInfo = merchantsData.find(m => m.auth0Id === merchant._id);
      return {
        _id: merchant._id,
        name: merchantInfo ? merchantInfo.name : 'Unknown Merchant',
        role: 'merchant',
        successfulTransactions: merchant.successfulTransactions,
        totalValue: merchant.totalValue,
        averageRating: 4.3 // Default rating for now
      };
    });

    // Top performing drivers based on bookings (using same logic as transporter page)
    console.log('🚚 Starting driver aggregation...');
    const topDriversAgg = await Booking.aggregate([
      {
        $group: {
          _id: '$transporterId',
          bookingCount: { $sum: 1 },
          // Count unique merchant phones as proxy for merchant count (since merchantId doesn't exist)
          merchantPhones: { $addToSet: '$merchantPhone' },
          latestBooking: { $last: '$$ROOT' }
        }
      },
      {
        $addFields: {
          merchantCount: { $size: '$merchantPhones' }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 }
    ]);

    console.log('🚚 Driver aggregation result:', topDriversAgg);

    // Get driver details
    const driverIds = topDriversAgg.map(d => d._id);
    console.log('🚚 Driver IDs to look up:', driverIds);
    
    const driversData = await User.find({
      auth0Id: { $in: driverIds }, 
      role: 'transporter'
    }).select('auth0Id name');

    console.log('🚚 Found driver users:', driversData);

    const topDrivers = topDriversAgg.map(driver => {
      const driverInfo = driversData.find(d => d.auth0Id === driver._id);
      return {
        _id: driver._id,
        name: driverInfo ? driverInfo.name : 'Unknown Driver',
        role: 'transporter',
        bookingCount: driver.bookingCount,
        merchantCount: driver.merchantCount,
        averageRating: 4.7 // Default rating for now
      };
    });

    console.log('🚚 Final top drivers:', topDrivers);

    // Most demanded products based on bids count
    const mostDemandedProducts = await Bid.aggregate([
      {
        $group: {
          _id: '$productName',
          totalBids: { $sum: 1 },
          uniqueBidders: { $addToSet: '$merchantId' },
          averageBidAmount: { $avg: '$bidAmount' }
        }
      },
      {
        $addFields: {
          uniqueBidders: { $size: '$uniqueBidders' }
        }
      },
      { $sort: { totalBids: -1 } },
      { $limit: 5 }
    ]);

    const analyticsData = {
      platformStats: {
        totalUsers,
        totalListings,
        totalBookings,
        totalConfirmedBids
      },
      topFarmers,
      topMerchants,
      topDrivers,
      mostDemandedProducts
    };

    console.log('📤 Sending analytics response with topDrivers count:', topDrivers.length);
    res.json(analyticsData);
  } catch (error) {
    console.error('Basic analytics endpoint error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics data',
      details: error.message
    });
  }
});

// Get all users by role
router.get('/users/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Delete user by ID
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Get admin analytics data - PROTECTED ROUTE
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    // 1. Top Performing Farmers - Based on accepted bids and confirmed orders
    const topFarmers = await Bid.aggregate([
      {
        $match: { status: 'Accepted' }
      },
      {
        $group: {
          _id: '$farmerId',
          farmerName: { $first: '$farmerId' }, // We'll need to populate this
          totalTransactions: { $sum: 1 }
        }
      },
      {
        $sort: { totalTransactions: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get farmer names for the top farmers
    const farmerIds = topFarmers.map(farmer => farmer._id);
    const farmersData = await User.find({ 
      auth0Id: { $in: farmerIds }, 
      role: 'farmer' 
    }).select('auth0Id name');

    const topFarmersWithNames = topFarmers.map(farmer => {
      const farmerInfo = farmersData.find(f => f.auth0Id === farmer._id);
      return {
        farmerId: farmer._id,
        farmerName: farmerInfo ? farmerInfo.name : 'Unknown',
        totalTransactions: farmer.totalTransactions
      };
    });

    // 2. Top Performing Merchants - Based on confirmed bids and bookings
    const topMerchants = await Bid.aggregate([
      {
        $match: { status: 'Accepted' }
      },
      {
        $group: {
          _id: '$merchantId',
          merchantName: { $first: '$merchantName' },
          totalTransactions: { $sum: 1 }
        }
      },
      {
        $sort: { totalTransactions: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get merchant names for better data consistency
    const merchantIds = topMerchants.map(merchant => merchant._id);
    const merchantsData = await User.find({ 
      auth0Id: { $in: merchantIds }, 
      role: 'merchant' 
    }).select('auth0Id name');

    const topMerchantsWithNames = topMerchants.map(merchant => {
      const merchantInfo = merchantsData.find(m => m.auth0Id === merchant._id);
      return {
        merchantId: merchant._id,
        merchantName: merchantInfo ? merchantInfo.name : merchant.merchantName,
        totalTransactions: merchant.totalTransactions
      };
    });

    // 3. Most Demanded Products - Based on bid count
    const mostDemandedProducts = await Bid.aggregate([
      {
        $group: {
          _id: '$productName',
          productName: { $first: '$productName' },
          totalBids: { $sum: 1 },
          acceptedBids: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { totalBids: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // 4. Additional insights - Transport bookings
    const topTransporterBookings = await Booking.aggregate([
      {
        $match: { status: { $in: ['confirmed', 'completed'] } }
      },
      {
        $group: {
          _id: '$transporterId',
          totalBookings: { $sum: 1 }
        }
      },
      {
        $sort: { totalBookings: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get transporter names
    const transporterIds = topTransporterBookings.map(t => t._id);
    const transportersData = await User.find({ 
      auth0Id: { $in: transporterIds }, 
      role: 'transporter' 
    }).select('auth0Id name');

    const topTransportersWithNames = topTransporterBookings.map(transporter => {
      const transporterInfo = transportersData.find(t => t.auth0Id === transporter._id);
      return {
        transporterId: transporter._id,
        transporterName: transporterInfo ? transporterInfo.name : 'Unknown',
        totalBookings: transporter.totalBookings
      };
    });

    // 5. Overall platform statistics
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalBids = await Bid.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const acceptedBids = await Bid.countDocuments({ status: 'Accepted' });

    const analyticsData = {
      topPerformers: {
        farmers: topFarmersWithNames,
        merchants: topMerchantsWithNames,
        transporters: topTransportersWithNames
      },
      mostDemandedProducts: mostDemandedProducts,
      platformStats: {
        totalUsers,
        totalProducts,
        totalBids,
        acceptedBids,
        totalBookings,
        bidAcceptanceRate: totalBids > 0 ? ((acceptedBids / totalBids) * 100).toFixed(2) : 0
      },
      generatedAt: new Date().toISOString()
    };

    res.json(analyticsData);

  } catch (error) {
    console.error('Analytics endpoint error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics data',
      details: error.message 
    });
  }
});

module.exports = router;