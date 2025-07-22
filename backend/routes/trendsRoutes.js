const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const ConfirmedBid = require('../models/ConfirmedBid');
const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb+srv://Piyumi:Piyu123@harvest-software.tgbx7.mongodb.net/harvest-sw?retryWrites=true&w=majority";

// Get trend analysis data for a farmer
const getFarmerTrends = async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    if (!farmerId) {
      return res.status(400).json({ error: 'Farmer ID is required' });
    }

    console.log(`Fetching trend analysis for farmer: ${farmerId}`);

    const client = await MongoClient.connect(uri);
    const db = client.db("harvest-sw");

    // Get current date for filtering last 12 months
    const currentDate = new Date();
    const twelveMonthsAgo = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);

    // Aggregate harvest data from products collection
    const harvestTrends = await db.collection('products').aggregate([
      {
        $match: {
          farmerID: farmerId,
          listedDate: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$listedDate" },
            month: { $month: "$listedDate" },
            category: "$type"
          },
          totalQuantity: { $sum: "$quantity" },
          avgBasePrice: { $avg: "$price" },
          products: { $push: "$$ROOT" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]).toArray();

    // Get bid data for demand analysis
    const bidTrends = await db.collection('bids').aggregate([
      {
        $match: {
          farmerId: farmerId,
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $unwind: {
          path: '$productInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            category: "$productInfo.type"
          },
          totalBids: { $sum: 1 },
          avgBidAmount: { $avg: "$bidAmount" },
          acceptedBids: {
            $sum: {
              $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0]
            }
          },
          rejectedBids: {
            $sum: {
              $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]).toArray();

    // Get confirmed sales data for revenue analysis
    const salesTrends = await db.collection('confirmedbids').aggregate([
      {
        $match: {
          farmerId: farmerId,
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $unwind: "$items"
      },
      {
        $lookup: {
          from: 'products',
          let: { productId: { $toObjectId: "$items.productId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$productId"] } } }
          ],
          as: 'productInfo'
        }
      },
      {
        $unwind: {
          path: '$productInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            category: "$productInfo.type"
          },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          totalQuantitySold: { $sum: "$items.quantity" },
          avgSellingPrice: { $avg: "$items.price" },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]).toArray();

    // Create comprehensive monthly data by merging all sources
    const monthlyTrends = {};
    const categories = new Set();

    // Process harvest data
    harvestTrends.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      const category = item._id.category || 'Unknown';
      categories.add(category);
      
      if (!monthlyTrends[key]) {
        monthlyTrends[key] = {
          year: item._id.year,
          month: item._id.month,
          monthName: new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' }),
          categories: {}
        };
      }
      
      if (!monthlyTrends[key].categories[category]) {
        monthlyTrends[key].categories[category] = {
          quantityListed: 0,
          avgBasePrice: 0,
          demandScore: 0,
          totalBids: 0,
          avgBidAmount: 0,
          acceptanceRate: 0,
          revenue: 0,
          quantitySold: 0,
          avgSellingPrice: 0
        };
      }
      
      monthlyTrends[key].categories[category].quantityListed = item.totalQuantity;
      monthlyTrends[key].categories[category].avgBasePrice = item.avgBasePrice;
    });

    // Process bid data
    bidTrends.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      const category = item._id.category || 'Unknown';
      categories.add(category);
      
      if (!monthlyTrends[key]) {
        monthlyTrends[key] = {
          year: item._id.year,
          month: item._id.month,
          monthName: new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' }),
          categories: {}
        };
      }
      
      if (!monthlyTrends[key].categories[category]) {
        monthlyTrends[key].categories[category] = {
          quantityListed: 0,
          avgBasePrice: 0,
          demandScore: 0,
          totalBids: 0,
          avgBidAmount: 0,
          acceptanceRate: 0,
          revenue: 0,
          quantitySold: 0,
          avgSellingPrice: 0
        };
      }
      
      monthlyTrends[key].categories[category].totalBids = item.totalBids;
      monthlyTrends[key].categories[category].avgBidAmount = item.avgBidAmount;
      monthlyTrends[key].categories[category].acceptanceRate = 
        item.totalBids > 0 ? (item.acceptedBids / item.totalBids) * 100 : 0;
      monthlyTrends[key].categories[category].demandScore = item.totalBids;
    });

    // Process sales data
    salesTrends.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      const category = item._id.category || 'Unknown';
      categories.add(category);
      
      if (!monthlyTrends[key]) {
        monthlyTrends[key] = {
          year: item._id.year,
          month: item._id.month,
          monthName: new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' }),
          categories: {}
        };
      }
      
      if (!monthlyTrends[key].categories[category]) {
        monthlyTrends[key].categories[category] = {
          quantityListed: 0,
          avgBasePrice: 0,
          demandScore: 0,
          totalBids: 0,
          avgBidAmount: 0,
          acceptanceRate: 0,
          revenue: 0,
          quantitySold: 0,
          avgSellingPrice: 0
        };
      }
      
      monthlyTrends[key].categories[category].revenue = item.totalRevenue;
      monthlyTrends[key].categories[category].quantitySold = item.totalQuantitySold;
      monthlyTrends[key].categories[category].avgSellingPrice = item.avgSellingPrice;
    });

    // Convert to array and fill missing months
    const sortedMonthlyData = [];
    const allCategories = Array.from(categories);
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (monthlyTrends[key]) {
        // Fill missing categories with zeros
        allCategories.forEach(category => {
          if (!monthlyTrends[key].categories[category]) {
            monthlyTrends[key].categories[category] = {
              quantityListed: 0,
              avgBasePrice: 0,
              demandScore: 0,
              totalBids: 0,
              avgBidAmount: 0,
              acceptanceRate: 0,
              revenue: 0,
              quantitySold: 0,
              avgSellingPrice: 0
            };
          }
        });
        sortedMonthlyData.push(monthlyTrends[key]);
      } else {
        // Create empty month data
        const emptyMonth = {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          monthName: date.toLocaleString('default', { month: 'short' }),
          categories: {}
        };
        
        allCategories.forEach(category => {
          emptyMonth.categories[category] = {
            quantityListed: 0,
            avgBasePrice: 0,
            demandScore: 0,
            totalBids: 0,
            avgBidAmount: 0,
            acceptanceRate: 0,
            revenue: 0,
            quantitySold: 0,
            avgSellingPrice: 0
          };
        });
        
        sortedMonthlyData.push(emptyMonth);
      }
    }

    // Calculate summary statistics
    const summaryStats = {
      totalProducts: await db.collection('products').countDocuments({ farmerID: farmerId }),
      totalRevenue: salesTrends.reduce((sum, item) => sum + (item.totalRevenue || 0), 0),
      totalBids: bidTrends.reduce((sum, item) => sum + (item.totalBids || 0), 0),
      avgAcceptanceRate: bidTrends.length > 0 ? 
        bidTrends.reduce((sum, item) => sum + (item.acceptedBids / item.totalBids * 100 || 0), 0) / bidTrends.length : 0,
      topPerformingCategory: null,
      categories: allCategories
    };

    // Find top performing category
    const categoryPerformance = {};
    allCategories.forEach(category => {
      const categoryRevenue = salesTrends
        .filter(item => item._id.category === category)
        .reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
      categoryPerformance[category] = categoryRevenue;
    });

    summaryStats.topPerformingCategory = Object.keys(categoryPerformance)
      .reduce((a, b) => categoryPerformance[a] > categoryPerformance[b] ? a : b, null);

    client.close();

    res.json({
      success: true,
      data: {
        monthlyTrends: sortedMonthlyData,
        summary: summaryStats,
        categories: allCategories
      }
    });

  } catch (error) {
    console.error('Error fetching farmer trends:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch trend analysis data',
      details: error.message 
    });
  }
};

// GET route for farmer trends
router.get('/farmer/:farmerId/trends', getFarmerTrends);

module.exports = router;
