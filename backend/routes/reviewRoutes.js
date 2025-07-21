const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Add a review
router.post('/', reviewController.addReview);

// Get reviews for a farmer
router.get('/farmer/:farmerId', reviewController.getFarmerReviews);

// Get average rating for a farmer
router.get('/farmer/:farmerId/average', reviewController.getFarmerAverageRating);

// Get farmers sorted by average rating
router.get('/farmers/by-rating', reviewController.getFarmersByRating);

module.exports = router;
