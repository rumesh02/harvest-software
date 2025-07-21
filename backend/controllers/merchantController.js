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

      // Get top-rated farmers (limit to top 5 for dashboard)
      let topFarmers = [];
      try {
        // First get farmers with ratings
        const farmerRatings = await Review.aggregate([
          // Group by farmerId and calculate average rating and review count
          {
            $group: {
              _id: "$farmerId",
              avgRating: { $avg: "$rating" },
              reviewCount: { $sum: 1 }
            }
          },
          // Filter farmers with at least 1 review
          {
            $match: {
              reviewCount: { $gte: 1 }
            }
          },
          // Sort by average rating in descending order
          {
            $sort: { avgRating: -1 }
          },
          // Limit to top 5 for dashboard
          {
            $limit: 5
          },
          // Lookup farmer details from User collection
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "farmerDetails"
            }
          },
          // Unwind farmer details
          {
            $unwind: "$farmerDetails"
          },
          // Filter only farmers (role = 'farmer')
          {
            $match: {
              "farmerDetails.role": "farmer"
            }
          },
          // Project final structure for dashboard
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

        // Format for dashboard display
        topFarmers = farmerRatings.map(farmer => ({
          name: farmer.name,
          location: farmer.district && farmer.province ? `${farmer.district}, ${farmer.province}` : farmer.address || "Location not available",
          orders: farmer.reviewCount, // Use review count as proxy for orders
          rating: farmer.avgRating,
          avatar: farmer.picture || null
        }));

        // If we have less than 5 rated farmers, fill with recent farmers (no rating)
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
        topFarmers = []; // Fallback to empty array if there's an error
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
  }
};

module.exports = merchantController;