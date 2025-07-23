const express = require('express');
const router = express.Router();
const Booking = require('../models/bookingModel');
const User = require('../models/User'); // Assuming drivers are stored in User collection
const mongoose = require('mongoose');

/**
 * @route GET /api/drivers/top-by-merchant/:merchantId
 * @desc Get top 5 drivers who received the most bookings from a specific merchant
 * @access Public (add authentication as needed)
 */
router.get('/top-by-merchant/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;
    
    // Validate merchantId
    if (!merchantId) {
      return res.status(400).json({ error: 'Merchant ID is required' });
    }

    // For Auth0 user IDs, we don't need ObjectId validation
    // if (!mongoose.Types.ObjectId.isValid(merchantId)) {
    //   return res.status(400).json({ error: 'Invalid Merchant ID format' });
    // }

    // Aggregate pipeline to get top drivers by booking count for a specific merchant
    const topDrivers = await Booking.aggregate([
      {
        // Match bookings for the specific merchant
        $match: {
          merchantId: merchantId, // Direct string comparison for Auth0 IDs
          // Optional: filter by status if needed (e.g., only completed bookings)
          // status: { $in: ['completed', 'confirmed'] }
        }
      },
      {
        // Group by transporterId (driver) and count bookings
        $group: {
          _id: '$transporterId',
          bookingCount: { $sum: 1 },
          // Collect additional booking info if needed
          bookings: {
            $push: {
              bookingId: '$_id',
              status: '$status',
              createdAt: '$createdAt'
            }
          }
        }
      },
      {
        // Sort by booking count in descending order
        $sort: { bookingCount: -1 }
      },
      {
        // Limit to top 5 drivers
        $limit: 5
      },
      {
        // Lookup driver details from User collection
        $lookup: {
          from: 'users', // Collection name (lowercase, pluralized)
          localField: '_id',
          foreignField: 'sub', // Auth0 user.sub field
          as: 'driverInfo'
        }
      },
      {
        // Unwind the driverInfo array
        $unwind: {
          path: '$driverInfo',
          preserveNullAndEmptyArrays: true // Include drivers even if user info is missing
        }
      },
      {
        // Project the final structure
        $project: {
          driverId: '$_id',
          bookingCount: 1,
          driver: {
            $cond: {
              if: '$driverInfo',
              then: {
                _id: '$driverInfo._id',
                name: '$driverInfo.name',
                email: '$driverInfo.email',
                phone: '$driverInfo.phone',
                picture: '$driverInfo.picture',
                profilePicture: '$driverInfo.profilePicture',
                address: '$driverInfo.address',
                rating: '$driverInfo.rating',
                isOnline: '$driverInfo.isOnline',
                vehicleType: '$driverInfo.vehicleType',
                licenseNumber: '$driverInfo.licenseNumber',
                experience: '$driverInfo.experience'
              },
              else: {
                _id: '$_id',
                name: `Driver ${String($._id).slice(-4)}`,
                email: null,
                phone: null,
                picture: null
              }
            }
          },
          recentBookings: {
            $slice: ['$bookings', 3] // Include 3 most recent bookings
          }
        }
      }
    ]);

    // If no drivers found
    if (!topDrivers || topDrivers.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No drivers found for this merchant',
        topDrivers: [],
        merchantId: merchantId
      });
    }

    // Calculate additional statistics
    const totalBookings = topDrivers.reduce((sum, driver) => sum + driver.bookingCount, 0);
    const averageBookingsPerDriver = totalBookings / topDrivers.length;

    // Response with comprehensive data
    res.status(200).json({
      success: true,
      message: 'Top drivers fetched successfully',
      data: {
        merchantId: merchantId,
        topDrivers: topDrivers.map(driver => ({
          driverId: driver.driverId,
          bookingCount: driver.bookingCount,
          name: driver.driver.name,
          email: driver.driver.email,
          phone: driver.driver.phone,
          profilePicture: driver.driver.picture || driver.driver.profilePicture,
          address: driver.driver.address,
          rating: driver.driver.rating || 0,
          isOnline: driver.driver.isOnline || false,
          vehicleType: driver.driver.vehicleType,
          licenseNumber: driver.driver.licenseNumber,
          experience: driver.driver.experience,
          recentBookings: driver.recentBookings
        })),
        statistics: {
          totalDrivers: topDrivers.length,
          totalBookings: totalBookings,
          averageBookingsPerDriver: Math.round(averageBookingsPerDriver * 100) / 100
        }
      }
    });

  } catch (error) {
    console.error('Error fetching top drivers by merchant:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch top drivers',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/drivers/stats-by-merchant/:merchantId
 * @desc Get detailed driver statistics for a specific merchant
 * @access Public (add authentication as needed)
 */
router.get('/stats-by-merchant/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { limit = 10, status } = req.query;

    if (!merchantId) {
      return res.status(400).json({ error: 'Valid Merchant ID is required' });
    }

    // Build match conditions
    const matchConditions = {
      merchantId: merchantId // Direct string comparison for Auth0 IDs
    };

    // Add status filter if provided
    if (status && status !== 'all') {
      matchConditions.status = status;
    }

    const driverStats = await Booking.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$transporterId',
          bookingCount: { $sum: 1 },
          statusBreakdown: {
            $push: '$status'
          },
          firstBooking: { $min: '$createdAt' },
          lastBooking: { $max: '$createdAt' }
        }
      },
      {
        $addFields: {
          statusCounts: {
            $reduce: {
              input: '$statusBreakdown',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [[
                      {
                        k: '$$this',
                        v: {
                          $add: [
                            { $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] },
                            1
                          ]
                        }
                      }
                    ]]
                  }
                ]
              }
            }
          }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'sub', // Auth0 user.sub field
          as: 'driverInfo'
        }
      },
      { $unwind: { path: '$driverInfo', preserveNullAndEmptyArrays: true } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        merchantId,
        driverStats: driverStats.map(stat => ({
          driverId: stat._id,
          bookingCount: stat.bookingCount,
          statusCounts: stat.statusCounts,
          firstBooking: stat.firstBooking,
          lastBooking: stat.lastBooking,
          driver: stat.driverInfo ? {
            name: stat.driverInfo.name,
            email: stat.driverInfo.email,
            phone: stat.driverInfo.phone,
            picture: stat.driverInfo.picture,
            rating: stat.driverInfo.rating
          } : null
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching driver statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch driver statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/drivers/top-transporters
 * @desc Get top 5 transporters who have received the most total bookings
 * @access Public (add authentication as needed)
 */
router.get('/top-transporters', async (req, res) => {
  try {
    const { limit = 5, status } = req.query;

    // Build match conditions for filtering
    const matchConditions = {};
    
    // Add status filter if provided
    if (status && status !== 'all') {
      matchConditions.status = status;
    }

    // Aggregate pipeline to get top transporters by total booking count
    const topTransporters = await Booking.aggregate([
      {
        // Match bookings based on optional filters
        $match: matchConditions
      },
      {
        // Group by transporterId and count total bookings
        $group: {
          _id: '$transporterId',
          bookingCount: { $sum: 1 },
          // Collect additional booking statistics
          statusBreakdown: {
            $push: '$status'
          },
          merchantCount: {
            $addToSet: '$merchantId' // Unique merchants this transporter has worked with
          },
          firstBooking: { $min: '$createdAt' },
          lastBooking: { $max: '$createdAt' },
          // Sample of recent bookings
          recentBookings: {
            $push: {
              bookingId: '$_id',
              merchantId: '$merchantId',
              status: '$status',
              createdAt: '$createdAt'
            }
          }
        }
      },
      {
        // Add computed fields
        $addFields: {
          merchantCount: { $size: '$merchantCount' }, // Convert to count
          statusCounts: {
            $reduce: {
              input: '$statusBreakdown',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [[
                      {
                        k: '$$this',
                        v: {
                          $add: [
                            { $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] },
                            1
                          ]
                        }
                      }
                    ]]
                  }
                ]
              }
            }
          },
          recentBookings: {
            $slice: [
              {
                $sortArray: {
                  input: '$recentBookings',
                  sortBy: { createdAt: -1 }
                }
              },
              3
            ]
          }
        }
      },
      {
        // Sort by booking count in descending order
        $sort: { bookingCount: -1 }
      },
      {
        // Limit to specified number (default 5)
        $limit: parseInt(limit)
      },
      {
        // Lookup transporter details from User collection
        $lookup: {
          from: 'users', // Collection name (lowercase, pluralized)
          localField: '_id',
          foreignField: 'sub', // Auth0 user.sub field
          as: 'transporterInfo'
        }
      },
      {
        // Unwind the transporterInfo array
        $unwind: {
          path: '$transporterInfo',
          preserveNullAndEmptyArrays: true // Include transporters even if user info is missing
        }
      },
      {
        // Project the final structure
        $project: {
          transporterId: '$_id',
          bookingCount: 1,
          merchantCount: 1,
          statusCounts: 1,
          firstBooking: 1,
          lastBooking: 1,
          recentBookings: 1,
          transporter: {
            $cond: {
              if: '$transporterInfo',
              then: {
                _id: '$transporterInfo._id',
                name: '$transporterInfo.name',
                email: '$transporterInfo.email',
                phone: '$transporterInfo.phone',
                picture: '$transporterInfo.picture',
                profilePicture: '$transporterInfo.profilePicture',
                address: '$transporterInfo.address',
                rating: '$transporterInfo.rating',
                isOnline: '$transporterInfo.isOnline',
                vehicleType: '$transporterInfo.vehicleType',
                licenseNumber: '$transporterInfo.licenseNumber',
                experience: '$transporterInfo.experience',
                joinedDate: '$transporterInfo.createdAt'
              },
              else: {
                _id: '$_id',
                name: `Transporter ${String($._id).slice(-4)}`,
                email: null,
                phone: null,
                picture: null
              }
            }
          }
        }
      }
    ]);

    // If no transporters found
    if (!topTransporters || topTransporters.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No transporters found',
        topTransporters: [],
        statistics: {
          totalTransporters: 0,
          totalBookings: 0
        }
      });
    }

    // Calculate overall statistics
    const totalBookings = topTransporters.reduce((sum, transporter) => sum + transporter.bookingCount, 0);
    const averageBookingsPerTransporter = totalBookings / topTransporters.length;

    // Response with comprehensive data
    res.status(200).json({
      success: true,
      message: 'Top transporters fetched successfully',
      data: {
        topTransporters: topTransporters.map(transporter => ({
          transporterId: transporter.transporterId,
          bookingCount: transporter.bookingCount,
          merchantCount: transporter.merchantCount,
          name: transporter.transporter.name,
          email: transporter.transporter.email,
          phone: transporter.transporter.phone,
          profilePicture: transporter.transporter.picture || transporter.transporter.profilePicture,
          address: transporter.transporter.address,
          rating: transporter.transporter.rating || 0,
          isOnline: transporter.transporter.isOnline || false,
          vehicleType: transporter.transporter.vehicleType,
          licenseNumber: transporter.transporter.licenseNumber,
          experience: transporter.transporter.experience,
          joinedDate: transporter.transporter.joinedDate,
          statusCounts: transporter.statusCounts,
          firstBooking: transporter.firstBooking,
          lastBooking: transporter.lastBooking,
          recentBookings: transporter.recentBookings
        })),
        statistics: {
          totalTransporters: topTransporters.length,
          totalBookings: totalBookings,
          averageBookingsPerTransporter: Math.round(averageBookingsPerTransporter * 100) / 100
        }
      }
    });

  } catch (error) {
    console.error('Error fetching top transporters:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch top transporters',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/drivers/transporter-stats
 * @desc Get comprehensive statistics for all transporters
 * @access Public (add authentication as needed)
 */
router.get('/transporter-stats', async (req, res) => {
  try {
    const { 
      limit = 10, 
      status, 
      sortBy = 'bookingCount', 
      sortOrder = 'desc',
      minBookings = 0
    } = req.query;

    // Build match conditions
    const matchConditions = {};
    if (status && status !== 'all') {
      matchConditions.status = status;
    }

    // Build sort object
    const sortObject = {};
    sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const transporterStats = await Booking.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$transporterId',
          bookingCount: { $sum: 1 },
          merchantCount: { $addToSet: '$merchantId' },
          statusBreakdown: { $push: '$status' },
          totalValue: { $sum: { $ifNull: ['$totalAmount', 0] } },
          avgWeight: { $avg: { $ifNull: ['$weight', 0] } },
          firstBooking: { $min: '$createdAt' },
          lastBooking: { $max: '$createdAt' }
        }
      },
      {
        $addFields: {
          merchantCount: { $size: '$merchantCount' },
          daysSinceFirst: {
            $divide: [
              { $subtract: [new Date(), '$firstBooking'] },
              86400000 // milliseconds in a day
            ]
          }
        }
      },
      {
        $match: {
          bookingCount: { $gte: parseInt(minBookings) }
        }
      },
      { $sort: sortObject },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'sub',
          as: 'transporterInfo'
        }
      },
      { $unwind: { path: '$transporterInfo', preserveNullAndEmptyArrays: true } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        transporterStats: transporterStats.map(stat => ({
          transporterId: stat._id,
          bookingCount: stat.bookingCount,
          merchantCount: stat.merchantCount,
          totalValue: stat.totalValue,
          avgWeight: Math.round(stat.avgWeight * 100) / 100,
          daysSinceFirst: Math.round(stat.daysSinceFirst),
          firstBooking: stat.firstBooking,
          lastBooking: stat.lastBooking,
          transporter: stat.transporterInfo ? {
            name: stat.transporterInfo.name,
            email: stat.transporterInfo.email,
            phone: stat.transporterInfo.phone,
            picture: stat.transporterInfo.picture,
            rating: stat.transporterInfo.rating
          } : null
        })),
        filters: {
          status,
          sortBy,
          sortOrder,
          minBookings,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching transporter statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transporter statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
