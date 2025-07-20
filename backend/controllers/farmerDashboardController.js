const Order = require('../models/Order');
const ConfirmedBid = require('../models/ConfirmedBid');
const User = require('../models/User');

const revenueController = {
  getMonthlyRevenue: async (req, res) => {
    try {
      const { farmerId } = req.params;
      const year = new Date().getFullYear();
      
      // Get all completed orders for this farmer in current year
      const orders = await Order.find({
        farmerId,
        status: 'completed',
        completedDate: {
          $gte: new Date(year, 0, 1),
          $lte: new Date(year, 11, 31)
        }
      });

      // Initialize monthly data array
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        name: new Date(year, i).toLocaleString('default', { month: 'short' }),
        revenue: 0
      }));

      // Calculate revenue for each month
      orders.forEach(order => {
        const month = new Date(order.completedDate).getMonth();
        monthlyData[month].revenue += order.totalAmount;
      });

      // Calculate totals
      const currentMonth = new Date().getMonth();
      const monthlyRevenue = monthlyData[currentMonth].revenue;
      const yearlyRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0);
      const totalOrders = orders.length;

      return res.json({
        monthlyData,
        monthlyRevenue,
        yearlyRevenue,
        totalOrders
      });
    } catch (error) {
      console.error('Revenue calculation error:', error);
      return res.status(500).json({ 
        message: "Error calculating revenue",
        error: error.message 
      });
    }
  },

  getFarmerDashboard: async (req, res) => {
    try {
      const { farmerId } = req.params;

      // Only get confirmed bids for this farmer
      const confirmedBids = await ConfirmedBid.find({
        farmerId,
        status: { $in: ['confirmed', 'paid'] } // Include both confirmed and paid statuses
      });

      // Calculate stats
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let monthlyRevenue = 0;
      let yearlyRevenue = 0;
      let totalOrders = confirmedBids.length;
      let monthlyDataArr = Array(12).fill(0);

      confirmedBids.forEach(bid => {
        const bidDate = new Date(bid.createdAt);
        const revenue = bid.amount; // use .amount field from your document

        if (bidDate.getFullYear() === currentYear) {
          yearlyRevenue += revenue;
          monthlyDataArr[bidDate.getMonth()] += revenue;
          if (bidDate.getMonth() === currentMonth) {
            monthlyRevenue += revenue;
          }
        }
      });

      const monthlyData = monthlyDataArr.map((revenue, i) => ({
        name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        revenue
      }));

      // Calculate top buyers from the same confirmed bids data
      const buyerStats = {};
      
      confirmedBids.forEach(bid => {
        const merchantId = bid.merchantId;
        
        if (!buyerStats[merchantId]) {
          buyerStats[merchantId] = {
            merchantId: merchantId,
            purchaseCount: 0,
            totalAmount: 0,
            totalQuantity: 0
          };
        }
        
        buyerStats[merchantId].purchaseCount += 1;
        buyerStats[merchantId].totalAmount += bid.amount || 0;
        
        // Calculate total quantity from items
        if (bid.items && bid.items.length > 0) {
          bid.items.forEach(item => {
            buyerStats[merchantId].totalQuantity += item.quantity || 0;
          });
        }
      });

      // Convert to array and sort by purchase count (descending), limit to top 5
      const sortedBuyers = Object.values(buyerStats)
        .sort((a, b) => b.purchaseCount - a.purchaseCount)
        .slice(0, 5);

      // Populate merchant details for top buyers
      const topBuyers = await Promise.all(
        sortedBuyers.map(async (buyer) => {
          try {
            // Find user by auth0Id (which matches merchantId)
            const merchant = await User.findOne({ auth0Id: buyer.merchantId });
            
            return {
              name: merchant ? merchant.name : 'Unknown Merchant',
              location: merchant ? merchant.district : 'Unknown',
              orders: buyer.purchaseCount,
              totalSpent: buyer.totalAmount,
              averageOrderValue: buyer.purchaseCount > 0 ? (buyer.totalAmount / buyer.purchaseCount).toFixed(2) : 0
            };
          } catch (error) {
            console.error(`Error fetching merchant details for ${buyer.merchantId}:`, error);
            return {
              name: 'Unknown Merchant',
              location: 'Unknown',
              orders: buyer.purchaseCount,
              totalSpent: buyer.totalAmount,
              averageOrderValue: buyer.purchaseCount > 0 ? (buyer.totalAmount / buyer.purchaseCount).toFixed(2) : 0
            };
          }
        })
      );

      res.json({
        monthlyRevenue,
        yearlyRevenue,
        monthlyData,
        totalOrders,
        topBuyers
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to load farmer dashboard", error: error.message });
    }
  },

  // @desc    Get top buyers (merchants) for a farmer
  // @route   GET /api/farmers/:farmerId/top-buyers
  // @access  Public
  getTopBuyers: async (req, res) => {
    try {
      const { farmerId } = req.params;
      const limit = parseInt(req.query.limit) || 5; // Default to top 5 buyers

      console.log(`Fetching top buyers for farmer: ${farmerId}, limit: ${limit}`);

      // 1. Find all confirmed/completed purchases for this farmer
      const confirmedBids = await ConfirmedBid.find({
        farmerId: farmerId,
        status: { $in: ['confirmed', 'paid'] } // Include both confirmed and paid statuses
      });

      console.log(`Found ${confirmedBids.length} confirmed bids for farmer ${farmerId}`);

      // 2. Group by merchantId and count purchases + total amount
      const buyerStats = {};
      
      confirmedBids.forEach(bid => {
        const merchantId = bid.merchantId;
        
        if (!buyerStats[merchantId]) {
          buyerStats[merchantId] = {
            merchantId: merchantId,
            purchaseCount: 0,
            totalAmount: 0,
            totalQuantity: 0
          };
        }
        
        buyerStats[merchantId].purchaseCount += 1;
        buyerStats[merchantId].totalAmount += bid.amount || 0;
        
        // Calculate total quantity from items
        if (bid.items && bid.items.length > 0) {
          bid.items.forEach(item => {
            buyerStats[merchantId].totalQuantity += item.quantity || 0;
          });
        }
      });

      console.log('Buyer stats calculated:', buyerStats);

      // 3. Convert to array and sort by purchase count (descending)
      const sortedBuyers = Object.values(buyerStats)
        .sort((a, b) => b.purchaseCount - a.purchaseCount)
        .slice(0, limit);

      console.log(`Top ${limit} buyers by purchase count:`, sortedBuyers);

      // 4. Populate merchant details (name, email, etc.)
      const topBuyersWithDetails = await Promise.all(
        sortedBuyers.map(async (buyer) => {
          try {
            // Find user by auth0Id (which matches merchantId)
            const merchant = await User.findOne({ auth0Id: buyer.merchantId });
            
            return {
              merchantId: buyer.merchantId,
              merchantName: merchant ? merchant.name : 'Unknown Merchant',
              merchantEmail: merchant ? merchant.email : 'No email',
              merchantPhone: merchant ? merchant.phone : 'No phone',
              merchantDistrict: merchant ? merchant.district : 'Unknown',
              purchaseCount: buyer.purchaseCount,
              totalAmount: buyer.totalAmount,
              totalQuantity: buyer.totalQuantity,
              averageOrderValue: buyer.purchaseCount > 0 ? (buyer.totalAmount / buyer.purchaseCount).toFixed(2) : 0
            };
          } catch (error) {
            console.error(`Error fetching merchant details for ${buyer.merchantId}:`, error);
            return {
              merchantId: buyer.merchantId,
              merchantName: 'Unknown Merchant',
              merchantEmail: 'No email',
              merchantPhone: 'No phone',
              merchantDistrict: 'Unknown',
              purchaseCount: buyer.purchaseCount,
              totalAmount: buyer.totalAmount,
              totalQuantity: buyer.totalQuantity,
              averageOrderValue: buyer.purchaseCount > 0 ? (buyer.totalAmount / buyer.purchaseCount).toFixed(2) : 0
            };
          }
        })
      );

      console.log('Top buyers with merchant details:', topBuyersWithDetails);

      res.json({
        success: true,
        farmerId: farmerId,
        topBuyers: topBuyersWithDetails,
        totalBuyers: Object.keys(buyerStats).length,
        message: `Found ${topBuyersWithDetails.length} top buyers for farmer`
      });

    } catch (error) {
      console.error('Error fetching top buyers:', error);
      res.status(500).json({ 
        success: false,
        message: "Error fetching top buyers for farmer",
        error: error.message 
      });
    }
  }
};

module.exports = {
  getFarmerDashboard: revenueController.getFarmerDashboard,
  getMonthlyRevenue: revenueController.getMonthlyRevenue,
  getTopBuyers: revenueController.getTopBuyers
};