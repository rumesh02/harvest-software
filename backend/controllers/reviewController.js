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

    // Find the farmer user by auth0Id to get the actual MongoDB ObjectId
    const farmer = await User.findOne({ auth0Id: farmerId });
    if (!farmer) {
      console.error('Farmer not found for auth0Id:', farmerId);
      return res.status(404).json({ message: 'Farmer not found' });
    }

    // Find the merchant user by auth0Id to get the actual MongoDB ObjectId
    const merchant = await User.findOne({ auth0Id: merchantId });
    if (!merchant) {
      console.error('Merchant not found for auth0Id:', merchantId);
      return res.status(404).json({ message: 'Merchant not found' });
    }

    console.log(`Found farmer: ${farmer.name} (${farmer._id}), merchant: ${merchant.name} (${merchant._id})`);

    // Check if review already exists for this order
    const existingReview = await Review.findOne({
      farmerId: farmer._id,
      merchantId: merchant._id,
      orderId: orderId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this order' });
    }

    // Save the review with ObjectId references
    const review = new Review({ 
      farmerId: farmer._id, 
      merchantId: merchant._id, 
      orderId, 
      rating, 
      comment: comment || ''
    });
    await review.save();

    console.log('Review saved successfully:', review._id);

    // Calculate the new average rating for the farmer using ObjectId
    const result = await Review.aggregate([
      { $match: { farmerId: farmer._id } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    const avgRating = result.length > 0 ? result[0].avgRating : 0;

    // Update the farmer's `farmerRatings` field using ObjectId
    await User.findByIdAndUpdate(farmer._id, { farmerRatings: avgRating });

    console.log(`Updated farmer ${farmer.name} rating to ${avgRating.toFixed(2)}`);

    res.status(201).json({ 
      message: 'Review added successfully', 
      avgRating: avgRating,
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
    
    // Find the farmer user by auth0Id to get the actual MongoDB ObjectId
    const farmer = await User.findOne({ auth0Id });
    if (!farmer) {
      console.log('Farmer not found for auth0Id:', auth0Id);
      return res.status(404).json({ message: 'Farmer not found', reviews: [] });
    }

    const reviews = await Review.find({ farmerId: farmer._id })
      .populate('merchantId', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${reviews.length} reviews for farmer ${farmer.name} (${farmer._id})`);
    res.json(reviews);
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
    
    // Find the farmer user by auth0Id to get the actual MongoDB ObjectId
    const farmer = await User.findOne({ auth0Id });
    if (!farmer) {
      console.log('Farmer not found for auth0Id:', auth0Id);
      return res.status(404).json({ avgRating: 0, count: 0 });
    }

    const result = await Review.aggregate([
      { $match: { farmerId: farmer._id } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);
    
    if (result.length === 0) {
      console.log(`No reviews found for farmer ${farmer.name}`);
      return res.json({ avgRating: 0, count: 0 });
    }
    
    console.log(`Farmer ${farmer.name} has average rating: ${result[0].avgRating} from ${result[0].count} reviews`);
    res.json({ avgRating: result[0].avgRating, count: result[0].count });
  } catch (err) {
    console.error('Error fetching farmer average rating:', err);
    res.status(500).json({ error: err.message, avgRating: 0, count: 0 });
  }
};
