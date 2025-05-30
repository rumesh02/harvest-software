const Booking = require('../models/Booking');
const axios = require('axios');
const { useEffect, useState } = require('react');

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
    // Optionally, fetch driver names/avatars if you have a Driver model

    res.json({
      totalBookings,
      monthlyData,
      topDrivers: topDriversAgg.map(d => ({
        driverId: d._id,
        count: d.count
      }))
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load transporter dashboard", error: error.message });
  }
};

const TransporterDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const { user } = useAuth(); // Assuming you have a useAuth hook to get the logged-in user

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user || !user.sub) return; // Guard clause to prevent error
      const res = await axios.get(`/api/dashboard/transporter/${user.sub}`);
      setDashboardData(res.data);
    };
    fetchDashboard();
  }, [user]);

  // Render your dashboard using dashboardData

  return (
    <div>
      {/* Your dashboard JSX */}
    </div>
  );
};

module.exports = { getTransporterDashboard, TransporterDashboard };