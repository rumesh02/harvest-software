const Order = require('../models/Order');
const ConfirmedBid = require('../models/ConfirmedBid');

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
        status: "confirmed" // must match your document's status exactly (case-sensitive)
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

      res.json({
        monthlyRevenue,
        yearlyRevenue,
        monthlyData,
        totalOrders
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to load farmer dashboard", error: error.message });
    }
  }
};

module.exports = revenueController;