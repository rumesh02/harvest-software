import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Badge,
  Divider,
  Button
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
  Chat as ChatIcon,
  LocalShipping as LocalShippingIcon,
  Info as InfoIcon,
  MarkEmailRead as MarkEmailReadIcon
} from '@mui/icons-material';
import { 
  useNotificationHandler, 
  getNotificationDisplayProps, 
  formatNotificationTime 
} from '../hooks/useNotificationHandler';
import axios from 'axios';

/**
 * Enhanced NotificationPanel component with comprehensive navigation
 */
const NotificationPanel = ({ userRole = 'farmer', userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const {
    handleNotificationClick,
    showSuccessMessage,
    showErrorMessage,
    SnackbarComponent
  } = useNotificationHandler(userRole);

  // Fetch notifications
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notificationsRes, unreadRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/notifications/${userId}`),
        axios.get(`http://localhost:5000/api/notifications/unread/${userId}`)
      ]);

      const sortedNotifications = notificationsRes.data.sort((a, b) => {
        // Unread first, then by priority, then by date
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
        
        const propsA = getNotificationDisplayProps(a);
        const propsB = getNotificationDisplayProps(b);
        if (propsA.priority !== propsB.priority) return propsA.priority - propsB.priority;
        
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setNotifications(sortedNotifications);
      setUnreadCount(unreadRes.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showErrorMessage('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/read/${notificationId}`);
      
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showErrorMessage('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/read-all/${userId}`);
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
      showSuccessMessage('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showErrorMessage('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      'newBid': <TrendingUpIcon />,
      'bid_received': <TrendingUpIcon />,
      'bidAccepted': <CheckCircleIcon />,
      'bid_accepted': <CheckCircleIcon />,
      'bidRejected': <CancelIcon />,
      'bid_rejected': <CancelIcon />,
      'paymentReceived': <PaymentIcon />,
      'payment_received': <PaymentIcon />,
      'order_confirmed': <CheckCircleIcon />,
      'chatMessage': <ChatIcon />,
      'message': <ChatIcon />,
      'vehicle_booked': <LocalShippingIcon />,
      'vehicleBooked': <LocalShippingIcon />,
      'vehicleStatusUpdate': <LocalShippingIcon />,
      'collection_update': <LocalShippingIcon />,
      'general': <InfoIcon />
    };
    
    return iconMap[type] || <InfoIcon />;
  };

  const handleNotificationItemClick = (notification) => {
    handleNotificationClick(notification, markAsRead);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading notifications...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
          </Box>
          
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<MarkEmailReadIcon />}
              onClick={markAllAsRead}
              variant="outlined"
            >
              Mark all read
            </Button>
          )}
        </Box>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
            <NotificationsIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" gutterBottom>
              No notifications
            </Typography>
            <Typography variant="body2">
              You'll see notifications here when there's activity on your account
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => {
              const displayProps = getNotificationDisplayProps(notification);
              
              return (
                <React.Fragment key={notification._id}>
                  <ListItem
                    sx={{
                      backgroundColor: notification.isRead ? 'transparent' : 'rgba(25, 118, 210, 0.04)',
                      borderLeft: notification.isRead ? 'none' : '4px solid #1976d2',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: notification.isRead 
                          ? 'rgba(0,0,0,0.02)' 
                          : 'rgba(25, 118, 210, 0.08)',
                        transform: 'translateX(2px)'
                      },
                      py: 2,
                      px: 3
                    }}
                    onClick={() => handleNotificationItemClick(notification)}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: notification.isRead ? '#f5f5f5' : displayProps.color,
                          color: notification.isRead ? '#666' : 'white',
                          width: 48,
                          height: 48
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          mb: 0.5
                        }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: notification.isRead ? 400 : 600,
                              color: 'text.primary',
                              flex: 1,
                              mr: 1
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatNotificationTime(notification.createdAt)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ mb: 1, lineHeight: 1.4 }}
                          >
                            {notification.message}
                          </Typography>
                          
                          {/* Metadata chips */}
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                            {notification.metadata?.amount && (
                              <Chip
                                label={`Rs. ${notification.metadata.amount.toLocaleString()}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            )}
                            
                            {notification.metadata?.productName && (
                              <Chip
                                label={notification.metadata.productName}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            )}
                            
                            {!notification.isRead && (
                              <Chip
                                label="New"
                                size="small"
                                color="error"
                                sx={{ fontSize: '0.7rem', height: 20, fontWeight: 600 }}
                              />
                            )}
                            
                            <Chip
                              label={displayProps.actionText}
                              size="small"
                              sx={{ 
                                fontSize: '0.7rem',
                                bgcolor: displayProps.color,
                                color: 'white',
                                fontWeight: 500,
                                '&:hover': { bgcolor: displayProps.color }
                              }}
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  
                  {index < notifications.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
      
      <SnackbarComponent />
    </Box>
  );
};

export default NotificationPanel;

/**
 * Example usage in your app:
 * 
 * import NotificationPanel from './components/NotificationPanel';
 * import { useAuth0 } from '@auth0/auth0-react';
 * 
 * function App() {
 *   const { user } = useAuth0();
 *   const userRole = localStorage.getItem('userRole');
 * 
 *   return (
 *     <NotificationPanel 
 *       userRole={userRole} 
 *       userId={user?.sub}
 *     />
 *   );
 * }
 */
