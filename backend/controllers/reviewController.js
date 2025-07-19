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
    const reviews = await Review.find({ farmerId: req.params.farmerId });
    res.json(reviews);
  } catch (err) {
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
