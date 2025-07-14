const Booking = require('../models/bookingModel');
const User = require('../models/User'); // or Driver model

const getTransporterDashboard = async (req, res) => {
  try {
    const { transporterId } = req.params;

    // Get all bookings for this transporter
    const bookings = await Booking.find({ transporterId });

    // Total bookings
    const totalBookings = bookings.length;

    // Monthly orders for chart
    const monthlyOrdersArr = Array(12).fill(0);
    bookings.forEach(b => {
      const date = new Date(b.createdAt);
      monthlyOrdersArr[date.getMonth()] += 1;
    });
    const monthlyData = monthlyOrdersArr.map((orders, i) => ({
      name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      orders
    }));

    // Top drivers by number of bookings
    const topDriversAgg = await Booking.aggregate([
      { $match: { transporterId } },
      { $group: { _id: "$driverId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 4 }
    ]);

    // Fetch driver details (if you have a User/Driver model)
    const topDrivers = await Promise.all(
      topDriversAgg.map(async d => {
        let driver = null;
        try {
          driver = await User.findById(d._id);
        } catch {}
        return {
          driverId: d._id,
          count: d.count,
          name: driver ? driver.name : "Unknown",
          image: driver ? driver.image : "/placeholder.svg"
        };
      })
    );

    res.json({
      totalBookings,
      monthlyData,
      topDrivers
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load transporter dashboard", error: error.message });
  }
};

module.exports = { getTransporterDashboard };