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
      const currentMonth = new Date().getMonth();

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
        status: { $in: ['confirmed', 'processing'] } // Same logic as in confirmedBidRoutes.js
      });

      // Calculate monthly purchase data
      const monthlyDataArr = Array(12).fill(0);
      let totalPurchaseAmount = 0;

      confirmedBids.forEach(bid => {
        const bidDate = new Date(bid.createdAt);
        const amount = bid.amount || 0; // ConfirmedBid uses 'amount'
        
        if (bidDate.getFullYear() === currentYear) {
          monthlyDataArr[bidDate.getMonth()] += amount;
          totalPurchaseAmount += amount;
        }
      });

      // Format monthly data for chart
      const monthlyData = monthlyDataArr.map((amount, index) => ({
        name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
        revenue: amount // Using 'revenue' to match frontend expectation
      }));

      // Calculate pending payments total (from ConfirmedBids, not Payment model)
      const pendingPaymentsTotal = pendingPayments.reduce((sum, payment) => {
        return sum + (payment.amount || 0);
      }, 0);

      // Get total orders (confirmed bids count)
      const totalOrders = confirmedBids.length;

      // Get top farmers based on ratings from this merchant's reviews
      const topFarmers = await getTopRatedFarmers(merchantId, 3);

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
        { $match: { merchantId: merchantId } }, // Only reviews from this merchant
        { 
          $group: { 
            _id: "$farmerId", 
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
            totalOrders: { $sum: 1 } // Count of orders with this farmer
          } 
        },
        { $match: { totalReviews: { $gte: 1 } } }, // At least 1 review
        { $sort: { averageRating: -1, totalReviews: -1 } }, // Sort by rating, then by review count
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
                averageRating: Math.round(rating.averageRating * 10) / 10, // Round to 1 decimal
                totalReviews: rating.totalReviews,
                orders: rating.totalOrders,
                avatar: farmer.picture || null // Profile picture if available
              };
            }
            return null;
          } catch (error) {
            console.error('Error fetching farmer details:', error);
            return null;
          }
        })
      );

      // Filter out null results and return
      return topFarmers.filter(farmer => farmer !== null);
    } catch (error) {
      console.error('Error getting top rated farmers:', error);
      return [];
    }
  }
};

// Export the helper function as well
const getTopRatedFarmers = merchantController.getTopRatedFarmers;

module.exports = merchantController;