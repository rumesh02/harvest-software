const User = require('../models/User');

// Update user location
const updateUserLocation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { coordinates, address } = req.body;

    // Validate coordinates
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid coordinates provided' 
      });
    }

    // Validate lat/lng ranges
    if (coordinates.lat < -90 || coordinates.lat > 90 || 
        coordinates.lng < -180 || coordinates.lng > 180) {
      return res.status(400).json({ 
        success: false, 
        message: 'Coordinates out of valid range' 
      });
    }

    const user = await User.findOneAndUpdate(
      { auth0Id: userId },
      {
        $set: {
          'location.coordinates': coordinates,
          'location.address': address || '',
          'location.lastUpdated': new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        location: user.location
      }
    });

  } catch (error) {
    console.error('Error updating user location:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Get user location
const getUserLocation = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ auth0Id: userId }).select('location');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: {
        location: user.location
      }
    });

  } catch (error) {
    console.error('Error getting user location:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Get nearby users (for finding nearby farmers, merchants, etc.)
const getNearbyUsers = async (req, res) => {
  try {
    const { lat, lng, radius = 10, role } = req.query;

    // Validate coordinates
    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: 'Latitude and longitude are required' 
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    // Validate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid coordinates' 
      });
    }

    // Calculate coordinate bounds (rough approximation)
    const latDelta = searchRadius / 111.32; // 1 degree lat ≈ 111.32 km
    const lngDelta = searchRadius / (111.32 * Math.cos(latitude * Math.PI / 180));

    const query = {
      'location.coordinates.lat': {
        $gte: latitude - latDelta,
        $lte: latitude + latDelta
      },
      'location.coordinates.lng': {
        $gte: longitude - lngDelta,
        $lte: longitude + lngDelta
      }
    };

    // Add role filter if specified
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('name email role location phone')
      .limit(50);

    // Calculate actual distances and filter
    const usersWithDistance = users.map(user => {
      const distance = calculateDistance(
        latitude,
        longitude,
        user.location.coordinates.lat,
        user.location.coordinates.lng
      );

      return {
        ...user.toObject(),
        distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
      };
    }).filter(user => user.distance <= searchRadius);

    // Sort by distance
    usersWithDistance.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      data: {
        users: usersWithDistance,
        count: usersWithDistance.length,
        searchParams: {
          center: { lat: latitude, lng: longitude },
          radius: searchRadius,
          role: role || 'all'
        }
      }
    });

  } catch (error) {
    console.error('Error finding nearby users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Get products by location
const getProductsByLocation = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: 'Latitude and longitude are required' 
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    // Import Product model
    const Product = require('../models/Product');

    // Calculate coordinate bounds
    const latDelta = searchRadius / 111.32;
    const lngDelta = searchRadius / (111.32 * Math.cos(latitude * Math.PI / 180));

    const products = await Product.find({
      'location.coordinates.lat': {
        $gte: latitude - latDelta,
        $lte: latitude + latDelta
      },
      'location.coordinates.lng': {
        $gte: longitude - lngDelta,
        $lte: longitude + lngDelta
      }
    });

    // Calculate distances and filter
    const productsWithDistance = products.map(product => {
      const distance = calculateDistance(
        latitude,
        longitude,
        product.location.coordinates.lat,
        product.location.coordinates.lng
      );

      return {
        ...product.toObject(),
        distance: Math.round(distance * 100) / 100
      };
    }).filter(product => product.distance <= searchRadius);

    // Sort by distance
    productsWithDistance.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      data: {
        products: productsWithDistance,
        count: productsWithDistance.length,
        searchParams: {
          center: { lat: latitude, lng: longitude },
          radius: searchRadius
        }
      }
    });

  } catch (error) {
    console.error('Error finding products by location:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

module.exports = {
  updateUserLocation,
  getUserLocation,
  getNearbyUsers,
  getProductsByLocation
};
