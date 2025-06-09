const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');

// Route to create a new user
router.post('/register', async (req, res) => {
  const {
    auth0Id,
    email,
    name,
    phone,
    nic,
    gender,
    address,
    province,
    district,
    role
  } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ auth0Id });
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered' });
    }

    const newUser = new User({
      auth0Id,
      email,
      name,
      phone,
      nic,
      gender,
      address,
      province,
      district,
      role
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: newUser });

  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Route to check if user exists by Auth0 ID
router.get('/check/:auth0Id', async (req, res) => {
    try {
      const decodedAuth0Id = decodeURIComponent(req.params.auth0Id);
      const user = await User.findOne({ auth0Id: decodedAuth0Id });
  
      res.json({
        exists: !!user,
        role: user?.role || null
      });
    } catch (error) {
      console.error('Error checking user existence:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
// Get user by MongoDB _id or Auth0 id
router.get('/:id', async (req, res) => {
  try {
    let user;
    // Try MongoDB ObjectId first
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      user = await User.findById(req.params.id);
    }
    // If not found, or not a valid ObjectId, try Auth0 id
    if (!user) {
      user = await User.findOne({ auth0Id: req.params.id });
    }
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      name: user.name,
      farmerRatings: user.farmerRatings || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
