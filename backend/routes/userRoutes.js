const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Route to get all users (for chat functionality)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'name role auth0Id'); // Include only needed fields
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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
  
// Route to get user details by Auth0 ID
router.get('/:auth0Id', async (req, res) => {
  try {
    const decodedAuth0Id = decodeURIComponent(req.params.auth0Id); // Decode the Auth0 ID
    const user = await User.findOne({ auth0Id: decodedAuth0Id }); // Query by auth0Id
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;