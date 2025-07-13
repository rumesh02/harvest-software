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

// Get recent chats with last message and unread count
router.get('/recent/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Get all conversations for this user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }]
        }
      },
      {
        $addFields: {
          otherUser: {
            $cond: {
              if: { $eq: ['$senderId', userId] },
              then: '$receiverId',
              else: '$senderId'
            }
          }
        }
      },
      {
        $group: {
          _id: '$otherUser',
          lastMessage: { $last: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$receiverId', userId] },
                    { $ne: ['$read', true] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.timestamp': -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get user details for each conversation
    const userIds = conversations.map(conv => conv._id);
    const users = await User.find({ auth0Id: { $in: userIds } }, 'auth0Id name role picture');

    // Combine user data with conversation data
    const recentChats = conversations.map(conv => {
      const user = users.find(u => u.auth0Id === conv._id);
      return {
        userId: conv._id,
        name: user?.name || 'Unknown User',
        role: user?.role || 'Unknown',
        picture: user?.picture || '',
        lastMessage: conv.lastMessage.message,
        lastMessageTime: conv.lastMessage.timestamp,
        unreadCount: conv.unreadCount
      };
    });

    res.json(recentChats);
  } catch (err) {
    console.error('Error getting recent chats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/read/:userId/:senderId', async (req, res) => {
  const { userId, senderId } = req.params;

  try {
    await Message.updateMany(
      { senderId: senderId, receiverId: userId, read: { $ne: true } },
      { read: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message count for notifications
router.get('/unread/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      read: { $ne: true }
    });

    res.json({ unreadCount });
  } catch (err) {
    console.error('Error getting unread count:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;