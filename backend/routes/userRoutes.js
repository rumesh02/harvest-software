const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET all users (for chat)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'name role auth0Id');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST register new user
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
    role,
    picture = ""
  } = req.body;

  try {
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
      role,
      picture
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: newUser });

  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// GET user exists by auth0 ID
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

// GET user details by auth0 ID
router.get('/:auth0Id', async (req, res) => {
  try {
    const decodedAuth0Id = decodeURIComponent(req.params.auth0Id);
    let user = await User.findOne({ auth0Id: decodedAuth0Id });

    if (!user) {
      user = new User({
        auth0Id: decodedAuth0Id,
        name: req.query.name || "",
        email: req.query.email || "",
        phone: "",
        nic: "",
        gender: "",
        address: "",
        province: "",
        district: "",
        picture: ""
      });
      await user.save();
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update user by auth0 ID
router.put('/:auth0Id', async (req, res) => {
  try {
    const decodedAuth0Id = decodeURIComponent(req.params.auth0Id);

    // Optional: validate picture is a base64 string
    const { picture, ...rest } = req.body;
    if (picture && typeof picture !== "string") {
      return res.status(400).json({ error: "Invalid image format" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { auth0Id: decodedAuth0Id },
      { ...rest, picture },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
