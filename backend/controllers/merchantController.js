const Bid = require('../models/Bid');

const merchantController = {
  getDashboardData: async (req, res) => {
    try {
      const { userSub } = req.params;

      // Total Orders (Confirmed Bids)
      const totalOrders = await Bid.countDocuments({
        merchantId: userSub,
        status: 'Confirmed'
      });

      // Pending Bids
      const pendingBids = await Bid.countDocuments({
        merchantId: userSub,
        status: 'Pending'
      });

      // Pending Payments (sum of bidAmount * orderWeight for pending bids)
      const pendingPaymentsAgg = await Bid.aggregate([
        {
          $match: {
            merchantId: userSub,
            status: 'Pending'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$bidAmount', '$orderWeight'] } }
          }
        }
      ]);
      const pendingPayments = pendingPaymentsAgg[0]?.total || 0;

      // Monthly Data (Confirmed Bids)
      const monthlyData = await Bid.aggregate([
        {
          $match: {
            merchantId: userSub,
            status: 'Confirmed'
          }
        },
        {
          $group: {
            _id: { $month: '$createdAt' },
            revenue: { $sum: { $multiply: ['$bidAmount', '$orderWeight'] } }
          }
        },
        {
          $project: {
            name: {
              $let: {
                vars: {
                  months: [
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                  ]
                },
                in: { $arrayElemAt: ['$$months', { $subtract: ['$_id', 1] }] }
              }
            },
            revenue: 1,
            _id: 0
          }
        },
        { $sort: { name: 1 } }
      ]);

      // Top Farmers (assuming this is what you want to include)
      const topFarmers = await Bid.aggregate([
        {
          $match: {
            merchantId: userSub,
            status: 'Confirmed'
          }
        },
        {
          $group: {
            _id: '$farmerId',
            totalRevenue: { $sum: { $multiply: ['$bidAmount', '$orderWeight'] } }
          }
        },
        {
          $sort: { totalRevenue: -1 }
        },
        {
          $limit: 5
        }
      ]);

      res.json({
        totalOrders,
        PendingBids: pendingBids,
        PendingPayments: `Rs. ${pendingPayments}`,
        monthlyData,
        topFarmers: (topFarmers || []).map((Farmer, index) => (
          { ...Farmer, rank: index + 1 }
        )) || []
      });

    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = merchantController;
