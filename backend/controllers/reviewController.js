const Review = require('../models/Review');
const User = require('../models/User');
const mongoose = require('mongoose');

// Add a review
exports.addReview = async (req, res) => {
  try {
    const { farmerId, merchantId, orderId, rating, comment } = req.body;

    // Save the review
    const review = new Review({ farmerId, merchantId, orderId, rating, comment });
    await review.save();

    // Calculate the new average rating for the farmer
    const result = await Review.aggregate([
      { $match: { farmerId: farmerId } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    const avgRating = result.length > 0 ? result[0].avgRating : 0;

    // Update the farmer's `farmerRatings` field
    await User.findByIdAndUpdate(farmerId, { farmerRatings: avgRating });

    res.status(201).json({ message: 'Review added successfully', avgRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get reviews for a farmer
exports.getFarmerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ farmerId: req.params.farmerId })
      .populate('merchantId', 'name email avatar')
      .populate('farmerId', 'name email avatar')
      .sort({ createdAt: -1 });
    
    // Format the response to match frontend expectations
    const formattedReviews = reviews.map(review => ({
      _id: review._id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      reviewer: {
        _id: review.merchantId?._id,
        name: review.merchantId?.name || 'Anonymous Merchant',
        email: review.merchantId?.email,
        avatar: review.merchantId?.avatar
      },
      farmer: {
        _id: review.farmerId?._id,
        name: review.farmerId?.name,
        email: review.farmerId?.email,
        avatar: review.farmerId?.avatar
      }
    }));
    
    res.json({ reviews: formattedReviews });
  } catch (err) {
    console.error('Error fetching farmer reviews:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get average rating for a farmer
exports.getFarmerAverageRating = async (req, res) => {
  try {
    const result = await Review.aggregate([
      { $match: { farmerId: new mongoose.Types.ObjectId(req.params.farmerId) } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);
    if (result.length === 0) return res.json({ avgRating: 0, count: 0 });
    res.json({ avgRating: result[0].avgRating, count: result[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get farmers sorted by average rating
exports.getFarmersByRating = async (req, res) => {
  try {
    const { limit = 50, minReviews = 1 } = req.query;
    
    // Aggregate reviews to calculate average rating per farmer
    const farmerRatings = await Review.aggregate([
      // Group by farmerId and calculate average rating and review count
      {
        $group: {
          _id: "$farmerId",
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
          totalRating: { $sum: "$rating" }
        }
      },
      // Filter farmers with minimum number of reviews
      {
        $match: {
          reviewCount: { $gte: parseInt(minReviews) }
        }
      },
      // Sort by average rating in descending order
      {
        $sort: { avgRating: -1 }
      },
      // Limit results
      {
        $limit: parseInt(limit)
      },
      // Lookup farmer details from User collection
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "farmerDetails"
        }
      },
      // Unwind farmer details
      {
        $unwind: "$farmerDetails"
      },
      // Filter only farmers (role = 'farmer')
      {
        $match: {
          "farmerDetails.role": "farmer"
        }
      },
      // Project final structure
      {
        $project: {
          _id: 1,
          avgRating: { $round: ["$avgRating", 2] },
          reviewCount: 1,
          totalRating: 1,
          farmer: {
            _id: "$farmerDetails._id",
            name: "$farmerDetails.name",
            email: "$farmerDetails.email",
            phone: "$farmerDetails.phone",
            address: "$farmerDetails.address",
            province: "$farmerDetails.province",
            district: "$farmerDetails.district",
            picture: "$farmerDetails.picture"
          }
        }
      }
    ]);

    // Also get farmers with no reviews (rating = 0)
    const farmersWithoutReviews = await User.find(
      { 
        role: "farmer",
        _id: { $nin: farmerRatings.map(f => f._id) }
      },
      {
        _id: 1,
        name: 1,
        email: 1,
        phone: 1,
        address: 1,
        province: 1,
        district: 1,
        picture: 1
      }
    ).limit(parseInt(limit) - farmerRatings.length);

    // Format farmers without reviews
    const farmersWithoutReviewsFormatted = farmersWithoutReviews.map(farmer => ({
      _id: farmer._id,
      avgRating: 0,
      reviewCount: 0,
      totalRating: 0,
      farmer: {
        _id: farmer._id,
        name: farmer.name,
        email: farmer.email,
        phone: farmer.phone,
        address: farmer.address,
        province: farmer.province,
        district: farmer.district,
        picture: farmer.picture
      }
    }));

    // Combine and sort all farmers
    const allFarmers = [...farmerRatings, ...farmersWithoutReviewsFormatted]
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: allFarmers,
      pagination: {
        total: allFarmers.length,
        limit: parseInt(limit),
        minReviews: parseInt(minReviews)
      }
    });
  } catch (err) {
    console.error('Error fetching farmers by rating:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};
