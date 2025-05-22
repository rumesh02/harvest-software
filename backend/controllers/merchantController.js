const Order = require('../models/Order');
const Bid = require('../models/Bid');

const merchantController = {
  getDashboardData: async (req, res) => {
    try {
      const { userSub } = req.params;
      console.log('1. Received userSub:', userSub);

      // Get completed orders only
      const totalOrders = await Order.countDocuments({ 
        merchantId: userSub,
        status: 'COMPLETED'  // Changed to match the enum in Order model
      });
      console.log('2. Completed orders found:', totalOrders);

      // Get pending bids from Bid collection
      const pendingBids = await Bid.countDocuments({
        merchantId: userSub,
        status: 'Pending'  // Matches the enum in Bid model
      });
      console.log('3. Pending bids found:', pendingBids);

      // Calculate pending payments from confirmed bids
      const pendingPayments = await Bid.aggregate([
        {
          $match: {
            merchantId: userSub,
            status: 'Accepted'  // Changed to get accepted bids for pending payments
          }
        },
        {
          $group: {
            _id: null,
            total: { 
              $sum: { $multiply: ['$bidAmount', '$orderWeight'] }
            }
          }
        }
      ]);
      console.log('4. Pending payments:', pendingPayments);

      // Get monthly data from completed orders
      const monthlyData = await Order.aggregate([
        {
          $match: {
            merchantId: userSub,
            status: 'COMPLETED'
          }
        },
        {
          $group: {
            _id: { 
              $month: '$completedDate'
            },
            revenue: { 
              $sum: '$totalAmount'
            }
          }
        },
        {
          $project: {
            name: {
              $let: {
                vars: {
                  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                },
                in: { $arrayElemAt: ['$$months', { $subtract: ['$_id', 1] }] }
              }
            },
            revenue: 1,
            _id: 0
          }
        },
        {
          $sort: { name: 1 }
        }
      ]);
      console.log('5. Monthly data:', monthlyData);

      // Get top farmers from completed orders
      const topFarmers = await Order.aggregate([
        {
          $match: {
            merchantId: userSub,
            status: 'COMPLETED'
          }
        },
        {
          $group: {
            _id: '$farmerId',
            totalAmount: { $sum: '$totalAmount' }
          }
        },
        {
          $sort: { totalAmount: -1 }
        },
        {
          $limit: 5
        }
      ]);
      console.log('6. Top farmers:', topFarmers);

      const response = {
        totalOrders,
        ActiveBids: pendingBids,  // Changed to use pending bids count
        PendingPayments: `Rs. ${pendingPayments[0]?.total || 0}`,
        monthlyData: monthlyData.length ? monthlyData : Array(12).fill(0).map((_, i) => ({
          name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
          revenue: 0
        })),
        topFarmers: topFarmers.map(farmer => ({
          name: `Farmer ${farmer._id}`,
          avatar: null,
          amount: farmer.totalAmount
        }))
      };

      console.log('7. Final response:', response);
      res.json(response);

    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = merchantController;