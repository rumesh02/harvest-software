const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');  // Added for the contacts endpoint
const File = require('../models/File');
const Emoji = require('../models/Emoji');

// Send message with file and emoji support
router.post('/send', async (req, res) => {
  try {
    const { 
      senderId, 
      receiverId, 
      message, 
      messageType = 'text',
      files = [],
      emojis = [],
      replyTo 
    } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Sender ID and Receiver ID are required'
      });
    }

    // Validate message content based on type
    if (messageType === 'text' && !message && files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required for text messages'
      });
    }

    // Create new message
    const newMessage = new Message({
      senderId,
      receiverId,
      message: message || '',
      messageType,
      files: files || [],
      emojis: emojis || [],
      replyTo: replyTo || null
    });

    await newMessage.save();

    // Populate file details if any
    if (files.length > 0) {
      await newMessage.populate('files.fileId');
    }

    // Populate reply message if any
    if (replyTo) {
      await newMessage.populate('replyTo');
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Add reaction to message
router.post('/reaction/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, emoji } = req.body;

    if (!userId || !emoji) {
      return res.status(400).json({
        success: false,
        message: 'User ID and emoji are required'
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      reaction => reaction.userId === userId && reaction.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction if it already exists
      message.reactions = message.reactions.filter(
        reaction => !(reaction.userId === userId && reaction.emoji === emoji)
      );
    } else {
      // Add new reaction
      message.reactions.push({
        userId,
        emoji,
        timestamp: new Date()
      });
    }

    await message.save();

    res.json({
      success: true,
      message: existingReaction ? 'Reaction removed' : 'Reaction added',
      reactions: message.reactions
    });

  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction',
      error: error.message
    });
  }
});

// Edit message
router.put('/edit/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, newMessage } = req.body;

    if (!userId || !newMessage) {
      return res.status(400).json({
        success: false,
        message: 'User ID and new message content are required'
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user owns the message
    if (message.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to edit this message'
      });
    }

    // Add to edit history
    message.editHistory.push({
      previousMessage: message.message,
      editedAt: new Date()
    });

    // Update message
    message.message = newMessage;
    message.isEdited = true;

    await message.save();

    res.json({
      success: true,
      message: 'Message edited successfully',
      data: message
    });

  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit message',
      error: error.message
    });
  }
});

// Delete message
router.delete('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user owns the message
    if (message.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this message'
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
});

// Get conversation between two users
router.get('/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  const { page = 1, limit = 50 } = req.query;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    })
    .populate('files.fileId')
    .populate('replyTo')
    .sort({ timestamp: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Message.countDocuments({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    });

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Get conversation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve conversation',
      error: err.message 
    });
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