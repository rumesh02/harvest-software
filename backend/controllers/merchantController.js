const Order = require('../models/Order');
const ConfirmedBid = require('../models/ConfirmedBid');
const Bid = require('../models/Bid');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const User = require('../models/User');

const merchantController = {
  getMerchantDashboard: async (req, res) => {
    try {
      const { merchantId } = req.params;
      console.log('Fetching dashboard data for merchant:', merchantId);

      // Get current year for filtering
      const currentYear = new Date().getFullYear();

      // Get all merchant's confirmed bids (purchases) for current year
      const confirmedBids = await ConfirmedBid.find({
        merchantId,
        status: "confirmed",
        createdAt: {
          $gte: new Date(currentYear, 0, 1),
          $lte: new Date(currentYear, 11, 31, 23, 59, 59)
        }
      });

      // Get pending bids
      const pendingBids = await Bid.find({
        merchantId,
        status: "Pending"
      });

      // Get pending payments (ConfirmedBids that are not yet paid)
      const pendingPayments = await ConfirmedBid.find({
        merchantId,
        status: { $in: ['confirmed', 'processing'] }
      });

      // Calculate monthly purchase data
      const monthlyDataArr = Array(12).fill(0);
      let totalPurchaseAmount = 0;

      confirmedBids.forEach(bid => {
        const bidDate = new Date(bid.createdAt);
        const amount = bid.amount || 0;
        if (bidDate.getFullYear() === currentYear) {
          monthlyDataArr[bidDate.getMonth()] += amount;
          totalPurchaseAmount += amount;
        }
      });

      // Format monthly data for chart
      const monthlyData = monthlyDataArr.map((amount, index) => ({
        name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
        revenue: amount
      }));

      // Calculate pending payments total
      const pendingPaymentsTotal = pendingPayments.reduce((sum, payment) => {
        return sum + (payment.amount || 0);
      }, 0);

      // Get total orders (confirmed bids count)
      const totalOrders = confirmedBids.length;

      // --- Top Farmers Aggregation (from main branch) ---
      let topFarmers = [];
      try {
        // Aggregate top-rated farmers (limit 5)
        const farmerRatings = await Review.aggregate([
          {
            $group: {
              _id: "$farmerId",
              avgRating: { $avg: "$rating" },
              reviewCount: { $sum: 1 }
            }
          },
          { $match: { reviewCount: { $gte: 1 } } },
          { $sort: { avgRating: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "farmerDetails"
            }
          },
          { $unwind: "$farmerDetails" },
          { $match: { "farmerDetails.role": "farmer" } },
          {
            $project: {
              _id: 1,
              avgRating: { $round: ["$avgRating", 1] },
              reviewCount: 1,
              name: "$farmerDetails.name",
              email: "$farmerDetails.email",
              phone: "$farmerDetails.phone",
              address: "$farmerDetails.address",
              province: "$farmerDetails.province",
              district: "$farmerDetails.district",
              picture: "$farmerDetails.picture"
            }
          }
        ]);

        topFarmers = farmerRatings.map(farmer => ({
          name: farmer.name,
          location: farmer.district && farmer.province ? `${farmer.district}, ${farmer.province}` : farmer.address || "Location not available",
          orders: farmer.reviewCount,
          rating: farmer.avgRating,
          avatar: farmer.picture || null
        }));

        // If less than 5, fill with recent farmers (no rating)
        if (topFarmers.length < 5) {
          const ratedFarmerIds = farmerRatings.map(f => f._id);
          const additionalFarmers = await User.find(
            {
              role: "farmer",
              _id: { $nin: ratedFarmerIds }
            },
            {
              _id: 1,
              name: 1,
              address: 1,
              province: 1,
              district: 1,
              picture: 1
            }
          ).limit(5 - topFarmers.length).sort({ createdAt: -1 });

          const additionalFormatted = additionalFarmers.map(farmer => ({
            name: farmer.name,
            location: farmer.district && farmer.province ? `${farmer.district}, ${farmer.province}` : farmer.address || "Location not available",
            orders: 0,
            rating: 0,
            avatar: farmer.picture || null
          }));

          topFarmers = [...topFarmers, ...additionalFormatted];
        }
      } catch (error) {
        console.error('Error fetching top farmers:', error);
        topFarmers = [];
      }

      const dashboardData = {
        PendingPayments: `Rs. ${pendingPaymentsTotal.toLocaleString()}`,
        PendingBids: pendingBids.length,
        totalOrders,
        monthlyData,
        topFarmers
      };

      console.log('Dashboard data prepared:', dashboardData);
      res.json(dashboardData);

    } catch (error) {
      console.error('Error fetching merchant dashboard:', error);
      res.status(500).json({
        error: "Failed to load merchant dashboard",
        details: error.message
      });
    }
  },

  // Helper function to get top rated farmers for a specific merchant
  async getTopRatedFarmers(merchantId, limit = 3) {
    try {
      // Get all reviews from this merchant to farmers, grouped by farmer
      const farmerRatings = await Review.aggregate([
        { $match: { merchantId: merchantId } },
        {
          $group: {
            _id: "$farmerId",
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
            totalOrders: { $sum: 1 }
          }
        },
        { $match: { totalReviews: { $gte: 1 } } },
        { $sort: { averageRating: -1, totalReviews: -1 } },
        { $limit: limit }
      ]);

      // Get farmer details for the top rated farmers
      const topFarmers = await Promise.all(
        farmerRatings.map(async (rating) => {
          try {
            const farmer = await User.findOne({ auth0Id: rating._id });
            if (farmer) {
              return {
                farmerId: rating._id,
                name: farmer.name,
                location: `${farmer.district || 'Unknown'}, ${farmer.province || 'Sri Lanka'}`,
                averageRating: Math.round(rating.averageRating * 10) / 10,
                totalReviews: rating.totalReviews,
                orders: rating.totalOrders,
                avatar: farmer.picture || null
              };
            }
            return null;
          } catch (error) {
            console.error('Error fetching farmer details:', error);
            return null;
          }
        })
      );

      return topFarmers.filter(farmer => farmer !== null);
    } catch (error) {
      console.error('Error getting top rated farmers:', error);
      return [];
    }
  }
};

const getTopRatedFarmers = merchantController.getTopRatedFarmers;

module.exports = merchantController;