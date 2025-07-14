import React, { useEffect, useState } from 'react';
import { Badge, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const NotificationBadge = ({ userId, onNotificationClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Fetch initial unread count
  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/messages/unread/${userId}`);
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
  }, [userId]);

  // Listen for new messages
  useEffect(() => {
    if (!userId) return;

    socket.on('receiveMessage', (message) => {
      if (message.receiverId === userId) {
        // Increment unread count
        setUnreadCount(prev => prev + 1);
        
        // Show notification
        setNotificationMessage(`New message from ${message.senderName || 'Someone'}`);
        setShowNotification(true);
        
        // Play notification sound (optional)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Message', {
            body: message.message,
            icon: '/logo192.png'
          });
        }
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [userId]);

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  return (
    <>
      <Tooltip title={`${unreadCount} unread messages`}>
        <IconButton 
          onClick={handleNotificationClick}
          sx={{ 
            color: unreadCount > 0 ? '#D97706' : '#6B7280',
            '&:hover': { color: '#D97706' }
          }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Snackbar
        open={showNotification}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity="info" 
          sx={{ width: '100%' }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationBadge; 