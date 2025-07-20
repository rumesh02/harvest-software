const Order = require('../models/Order');
const ConfirmedBid = require('../models/ConfirmedBid');
const Bid = require('../models/Bid');
const Payment = require('../models/Payment');

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

      // TODO: Get top farmers data (for now returning empty array)
      const topFarmers = [];

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