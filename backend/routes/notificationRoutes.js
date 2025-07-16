const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get all notifications for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    console.log('🔍 Fetching notifications for userId:', userId);
    console.log('🔍 UserId type:', typeof userId);
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    console.log('📋 Found notifications count:', notifications.length);
    console.log('📋 First few notifications:', notifications.slice(0, 3).map(n => ({
      id: n._id,
      userId: n.userId,
      type: n.type,
      title: n.title
    })));

    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread notification count for a user
router.get('/unread/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    });

    res.json({ unreadCount });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/read/:notificationId', async (req, res) => {
  const { notificationId } = req.params;

  try {
    await Notification.findByIdAndUpdate(
      notificationId, 
      { isRead: true },
      { new: true }
    );

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read for a user
router.put('/read-all/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all message notifications from a specific sender as read
router.put('/read-messages/:userId/:senderId', async (req, res) => {
  const { userId, senderId } = req.params;

  try {
    await Notification.updateMany(
      { 
        userId, 
        type: 'message',
        'metadata.senderId': senderId,
        isRead: false 
      },
      { isRead: true }
    );

    res.json({ message: 'Message notifications marked as read' });
  } catch (err) {
    console.error('Error marking message notifications as read:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new notification
router.post('/', async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
