const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Update user roles to lowercase
router.get('/update-user-roles', async (req, res) => {
  try {
    await User.updateMany({ role: "Farmer" }, { $set: { role: "farmer" } });
    await User.updateMany({ role: "Merchant" }, { $set: { role: "merchant" } });
    await User.updateMany({ role: "Transporter" }, { $set: { role: "transporter" } });
    res.json({ message: "User roles updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user roles" });
  }
});

router.get('/user-counts', async (req, res) => {
  try {
    const farmers = await User.countDocuments({ role: "farmer" });
    const merchants = await User.countDocuments({ role: "merchant" });
    const transporters = await User.countDocuments({ role: "transporter" });
    res.json({ farmers, merchants, transporters });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user counts" });
  }
});

// Get all users by role
router.get('/users/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Delete user by ID
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;