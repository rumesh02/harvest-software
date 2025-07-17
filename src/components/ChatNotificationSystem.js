import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Avatar,
  Box,
  Typography,
  IconButton,
  Slide,
  Grow
} from '@mui/material';
import {
  Close as CloseIcon,
  Reply as ReplyIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledAlert = styled(Alert)(({ theme }) => ({
  backgroundColor: '#ffffff',
  color: '#1f2937',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  '& .MuiAlert-icon': {
    display: 'none',
  },
  '& .MuiAlert-action': {
    padding: 0,
  },
  minWidth: '350px',
  padding: '8px 16px',
}));

const MessagePreview = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  color: '#6b7280',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '200px',
}));

function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

const ChatNotificationSystem = ({ 
  currentUserId, 
  socket, 
  onNotificationClick,
  selectedUserId 
}) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      // Don't show notification if chat with sender is currently open
      if (message.senderId === selectedUserId) return;
      
      // Don't show notification for own messages
      if (message.senderId === currentUserId) return;

      const notification = {
        id: Date.now(),
        type: 'message',
        senderId: message.senderId,
        senderName: message.senderName,
        message: message.message,
        timestamp: message.timestamp,
        avatar: null, // Will be fetched if needed
      };

      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep max 5 notifications

      // Auto remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    };

    socket.on('receiveMessage', handleNewMessage);

    return () => {
      socket.off('receiveMessage', handleNewMessage);
    };
  }, [socket, currentUserId, selectedUserId]);

  const handleNotificationClick = (notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification.senderId);
    }
    removeNotification(notification.id);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
      {notifications.map((notification, index) => (
        <Grow
          in={true}
          timeout={300}
          key={notification.id}
          style={{ transformOrigin: 'top right' }}
        >
          <Box sx={{ mb: 1 }}>
            <StyledAlert
              severity="info"
              action={
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleNotificationClick(notification)}
                    sx={{ 
                      color: '#10b981',
                      '&:hover': { backgroundColor: '#f0fdf4' }
                    }}
                  >
                    <ReplyIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => removeNotification(notification.id)}
                    sx={{ color: '#6b7280' }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                },
              }}
              onClick={() => handleNotificationClick(notification)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  src={notification.avatar}
                  sx={{ 
                    width: 36, 
                    height: 36,
                    border: '2px solid #10b981'
                  }}
                >
                  {notification.senderName?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#1f2937',
                      fontSize: '14px'
                    }}
                  >
                    {notification.senderName}
                  </Typography>
                  <MessagePreview>
                    {notification.message}
                  </MessagePreview>
                </Box>
              </Box>
            </StyledAlert>
          </Box>
        </Grow>
      ))}
    </Box>
  );
};

export default ChatNotificationSystem;
