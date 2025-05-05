const Order = require('../models/Order');

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
  }
};

module.exports = revenueController;