const Review = require('../models/Review');
const User = require('../models/User');

// Add a review
exports.addReview = async (req, res) => {
  try {
    const { farmerId, merchantId, orderId, rating, comment } = req.body;

    console.log('Received review data:', { farmerId, merchantId, orderId, rating, comment });

    // Validation
    if (!farmerId || !merchantId || !orderId || !rating) {
      return res.status(400).json({ message: 'Missing required fields: farmerId, merchantId, orderId, rating' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Resolve farmer and merchant ObjectIds
    const farmer = await User.findOne({ auth0Id: farmerId });
    if (!farmer) {
      console.error('Farmer not found for auth0Id:', farmerId);
      return res.status(404).json({ message: 'Farmer not found' });
    }

    const merchant = await User.findOne({ auth0Id: merchantId });
    if (!merchant) {
      console.error('Merchant not found for auth0Id:', merchantId);
      return res.status(404).json({ message: 'Merchant not found' });
    }

    console.log(`Found farmer: ${farmer.name} (${farmer._id}), merchant: ${merchant.name} (${merchant._id})`);

    // Prevent duplicate review per order
    const existingReview = await Review.findOne({
      farmerId: farmer._id,
      merchantId: merchant._id,
      orderId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this order' });
    }

    // Create and save review
    const review = new Review({
      farmerId: farmer._id,
      merchantId: merchant._id,
      orderId,
      rating,
      comment: comment || ''
    });

    await review.save();
    console.log('Review saved successfully:', review._id);

    // Update average rating
    const result = await Review.aggregate([
      { $match: { farmerId: farmer._id } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const avgRating = result.length > 0 ? result[0].avgRating : 0;

    await User.findByIdAndUpdate(farmer._id, { farmerRating: avgRating });
    console.log(`Updated farmer ${farmer.name} rating to ${avgRating.toFixed(2)}`);

    res.status(201).json({
      message: 'Review added successfully',
      avgRating,
      reviewId: review._id
    });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// Get reviews for a farmer
exports.getFarmerReviews = async (req, res) => {
  try {
    const auth0Id = req.params.farmerId;

    console.log('Fetching reviews for farmer auth0Id:', auth0Id);

    const farmer = await User.findOne({ auth0Id });
    if (!farmer) {
      console.log('Farmer not found for auth0Id:', auth0Id);
      return res.status(404).json({ message: 'Farmer not found', reviews: [] });
    }

    const reviews = await Review.find({ farmerId: farmer._id })
      .populate('merchantId', 'name email avatar')
      .populate('farmerId', 'name email avatar')
      .sort({ createdAt: -1 });

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
    res.status(500).json({ error: err.message, reviews: [] });
  }
};

// Get average rating for a farmer
exports.getFarmerAverageRating = async (req, res) => {
  try {
    const auth0Id = req.params.farmerId;
    console.log('Fetching average rating for farmer auth0Id:', auth0Id);

    const farmer = await User.findOne({ auth0Id });
    if (!farmer) {
      console.log('Farmer not found for auth0Id:', auth0Id);
      return res.status(404).json({ avgRating: 0, count: 0 });
    }

    const result = await Review.aggregate([
      { $match: { farmerId: farmer._id } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    if (result.length === 0) {
      return res.json({ avgRating: 0, count: 0 });
    }

    res.json({ avgRating: result[0].avgRating, count: result[0].count });
  } catch (err) {
    console.error('Error fetching farmer average rating:', err);
    res.status(500).json({ error: err.message, avgRating: 0, count: 0 });
  }
};

// Get farmers sorted by average rating
exports.getFarmersByRating = async (req, res) => {
  try {
    const { limit = 50, minReviews = 1 } = req.query;

    const farmerRatings = await Review.aggregate([
      {
        $group: {
          _id: '$farmerId',
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
          totalRating: { $sum: '$rating' }
        }
      },
      {
        $match: {
          reviewCount: { $gte: parseInt(minReviews) }
        }
      },
      { $sort: { avgRating: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'farmerDetails'
        }
      },
      { $unwind: '$farmerDetails' },
      {
        $match: {
          'farmerDetails.role': 'farmer'
        }
      },
      {
        $project: {
          _id: 1,
          avgRating: { $round: ['$avgRating', 2] },
          reviewCount: 1,
          totalRating: 1,
          farmer: {
            _id: '$farmerDetails._id',
            name: '$farmerDetails.name',
            email: '$farmerDetails.email',
            phone: '$farmerDetails.phone',
            address: '$farmerDetails.address',
            province: '$farmerDetails.province',
            district: '$farmerDetails.district',
            picture: '$farmerDetails.picture'
          }
        }
      }
    ]);

    const farmersWithoutReviews = await User.find({
      role: 'farmer',
      _id: { $nin: farmerRatings.map(f => f._id) }
    }).limit(parseInt(limit) - farmerRatings.length);

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
