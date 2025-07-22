const mongoose = require('mongoose');
const User = require('./models/User');
const Review = require('./models/Review');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/harvest-software', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function debugReviews() {
  try {
    console.log('=== DEBUGGING REVIEWS SYSTEM ===\n');
    
    // Check if we have users
    console.log('1. Checking existing users...');
    const farmers = await User.find({ role: 'farmer' }).limit(5);
    const merchants = await User.find({ role: 'merchant' }).limit(5);
    
    console.log(`Found ${farmers.length} farmers and ${merchants.length} merchants`);
    
    if (farmers.length > 0) {
      console.log('\nSample farmers:');
      farmers.forEach(farmer => {
        console.log(`- ${farmer.name} (${farmer.auth0Id})`);
      });
    }
    
    if (merchants.length > 0) {
      console.log('\nSample merchants:');
      merchants.forEach(merchant => {
        console.log(`- ${merchant.name} (${merchant.auth0Id})`);
      });
    }
    
    // Check existing reviews
    console.log('\n2. Checking existing reviews...');
    const reviews = await Review.find().populate('farmerId merchantId', 'name email');
    console.log(`Found ${reviews.length} existing reviews`);
    
    if (reviews.length > 0) {
      console.log('\nExisting reviews:');
      reviews.forEach(review => {
        console.log(`- Farmer: ${review.farmerId?.name}, Merchant: ${review.merchantId?.name}, Rating: ${review.rating}/5`);
      });
    } else {
      console.log('No reviews found in database');
    }
    
    // Test creating a sample review if we have both farmer and merchant
    if (farmers.length > 0 && merchants.length > 0) {
      console.log('\n3. Creating sample review...');
      
      const sampleReview = new Review({
        farmerId: farmers[0]._id,
        merchantId: merchants[0]._id,
        orderId: 'TEST_ORDER_' + Date.now(),
        rating: 4,
        comment: 'Great quality produce, fast delivery!'
      });
      
      await sampleReview.save();
      console.log('Sample review created successfully!');
      
      // Test the API endpoint functionality
      console.log('\n4. Testing average rating calculation...');
      const result = await Review.aggregate([
        { $match: { farmerId: farmers[0]._id } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);
      
      console.log('Average rating result:', result);
    }
    
  } catch (error) {
    console.error('Error debugging reviews:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugReviews();
