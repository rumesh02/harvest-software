const Bid = require('../models/Bid');

const merchantController = {
  getDashboardData: async (req, res) => {
    try {
      console.log('Merchant dashboard controller called');
      console.log('Request params:', req.params);
      console.log('Request URL:', req.url);
      
      const { userSub } = req.params;

      console.log('Fetching dashboard data for merchant:', userSub);
      
      if (!userSub) {
        return res.status(400).json({ error: 'Merchant ID is required' });
      }

      // Test database connection
      try {
        const testCount = await Bid.countDocuments({});
        console.log('Database connection test - total bids:', testCount);
      } catch (dbError) {
        console.error('Database connection error:', dbError);
        return res.status(500).json({ error: 'Database connection failed', details: dbError.message });
      }

      // Total Orders (Accepted Bids)
      const totalOrders = await Bid.countDocuments({
        merchantId: userSub,
        status: 'Accepted'
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

      // Monthly Data (Accepted Bids)
      const monthlyData = await Bid.aggregate([
        {
          $match: {
            merchantId: userSub,
            status: 'Accepted'
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

      // Top Farmers (Accepted Bids)
      const topFarmers = await Bid.aggregate([
        {
          $match: {
            merchantId: userSub,
            status: 'Accepted'
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

      const dashboardData = {
        totalOrders,
        PendingBids: pendingBids,
        PendingPayments: `Rs. ${pendingPayments}`,
        monthlyData,
        topFarmers: (topFarmers || []).map((Farmer, index) => (
          { ...Farmer, rank: index + 1 }
        )) || []
      };

      console.log('Dashboard data prepared:', dashboardData);
      res.json(dashboardData);

    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ 
        error: 'Failed to load dashboard data',
        details: error.message 
      });
    }
  }
};

module.exports = merchantController;
