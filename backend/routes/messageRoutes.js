const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');  // Added for the contacts endpoint

// Get conversation between two users
router.get('/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all unique users chatted with (for chat contacts list)
router.get('/contacts/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    });

    const userIds = new Set();

    messages.forEach(msg => {
      if (msg.senderId !== userId) userIds.add(msg.senderId);
      if (msg.receiverId !== userId) userIds.add(msg.receiverId);
    });

    const users = await User.find({ auth0Id: { $in: Array.from(userIds) } }, 'auth0Id name role');

    res.json(users);
  } catch (err) {
    console.error('Error getting contacts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;