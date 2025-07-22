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

// 🚛 NEW: Get Top 5 Transporters by Booking Count
const getTopTransporters = async (req, res) => {
  try {
    console.log('🚛 Getting top transporters by booking count...');

    // Extract query parameters
    const limit = parseInt(req.query.limit) || 5;
    const status = req.query.status; // Optional status filter

    // Build match criteria
    const matchCriteria = {};
    if (status && status !== 'all') {
      matchCriteria.status = status;
    }

    // MongoDB Aggregation Pipeline
    const topTransportersAgg = await Booking.aggregate([
      // Match bookings by status (if provided)
      ...(Object.keys(matchCriteria).length > 0 ? [{ $match: matchCriteria }] : []),
      
      // Group by transporterId and count bookings
      {
        $group: {
          _id: "$transporterId",
          bookingCount: { $sum: 1 },
          // Collect unique merchant IDs for each transporter
          merchantIds: { $addToSet: "$merchantId" },
          // Get latest booking for additional info
          latestBooking: { $last: "$$ROOT" }
        }
      },
      
      // Add merchant count
      {
        $addFields: {
          merchantCount: { $size: "$merchantIds" }
        }
      },
      
      // Sort by booking count in descending order
      { $sort: { bookingCount: -1 } },
      
      // Limit to top N transporters
      { $limit: limit }
    ]);

    console.log(`📊 Found ${topTransportersAgg.length} transporters from aggregation`);

    // Populate transporter details from User collection
    const topTransporters = await Promise.all(
      topTransportersAgg.map(async (transporter) => {
        // Add null check for transporter object
        if (!transporter || !transporter._id) {
          console.error('❌ Invalid transporter object:', transporter);
          return null;
        }

        let transporterDetails = null;
        
        try {
          // Find user by Auth0 ID (transporterId)
          transporterDetails = await User.findOne({ auth0Id: transporter._id });
        } catch (err) {
          console.error(`❌ Error fetching transporter ${transporter._id}:`, err.message);
        }

        const transporterId = transporter._id || '';
        const transporterIdSuffix = transporterId.length > 4 ? transporterId.slice(-4) : transporterId;

        return {
          transporterId: transporterId,
          name: transporterDetails?.name || `Transporter ${transporterIdSuffix}`,
          profilePicture: transporterDetails?.picture || null,
          phone: transporterDetails?.phone || null,
          email: transporterDetails?.email || null,
          bookingCount: transporter.bookingCount || 0,
          merchantCount: transporter.merchantCount || 0,
          // Additional info from latest booking
          latestBookingDate: transporter.latestBooking?.createdAt || null,
          vehicleType: transporter.latestBooking?.vehicleType || null
        };
      })
    );

    // Filter out any null results
    const validTransporters = topTransporters.filter(t => t !== null);

    console.log('✅ Successfully fetched top transporters:', validTransporters.length);

    res.json({
      success: true,
      message: `Top ${limit} transporters retrieved successfully`,
      data: {
        topTransporters: validTransporters,
        totalFound: validTransporters.length,
        requestedLimit: limit,
        statusFilter: status || 'all'
      }
    });

  } catch (error) {
    console.error('❌ Error in getTopTransporters:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch top transporters", 
      error: error.message 
    });
  }
};

module.exports = { 
  getTransporterDashboard,
  getTopTransporters
};