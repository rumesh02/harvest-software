import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  Chip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
  Info as InfoIcon,
  MarkEmailRead as MarkEmailReadIcon,
  LocalShipping as LocalShippingIcon,
  Message as MessageIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { 
  handleNotificationClick as handleNotificationClickUtil,
  getNotificationDisplayData,
  formatNotificationTime
} from '../utils/notificationUtils';

const socket = io('http://localhost:5000');

const NotificationBell = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);
  
  // Get user role from localStorage for navigation
  const userRole = localStorage.getItem('userRole');

  // Fetch notifications and unread count
  useEffect(() => {
    // Get user ID from Auth0 or localStorage (for farmers/merchants)
    const userId = user?.sub || localStorage.getItem('user_id');
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        console.log('🔔 Fetching notifications for user:', userId);
        console.log('🔔 User role/type check:', {
          hasAuth0User: !!user,
          auth0Sub: user?.sub,
          localStorageUserId: localStorage.getItem('user_id'),
          finalUserId: userId
        });
        
        const [notificationsRes, unreadRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/notifications/${userId}`),
          axios.get(`http://localhost:5000/api/notifications/unread/${userId}`)
        ]);

        console.log('📋 Notifications fetched:', notificationsRes.data);
        console.log('🔢 Unread count:', unreadRes.data.unreadCount);
        
        // Filter for vehicle booking notifications to debug
        const vehicleNotifications = notificationsRes.data.filter(n => n.type === 'vehicle_booked');
        if (vehicleNotifications.length > 0) {
          console.log('🚚 Vehicle booking notifications found:', vehicleNotifications);
        }
        
        setNotifications(notificationsRes.data);
        setUnreadCount(unreadRes.data.unreadCount);
      } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        console.error('❌ Error details:', error.response?.data);
      }
    };

    fetchNotifications();

    // Refresh every 10 seconds to catch new notifications faster
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Listen for real-time notifications
  useEffect(() => {
    // Get user ID from Auth0 or localStorage (for farmers/merchants)
    const userId = user?.sub || localStorage.getItem('user_id');
    if (!userId) return;

    console.log('Setting up socket listeners for user:', userId);
    
    // Join user to their specific room
    socket.emit('join', userId);

    const handleBidAccepted = (data) => {
      console.log('Bid accepted event received:', data);
      if (data.merchantId === userId) {
        // Refresh notifications when a bid is accepted for this merchant
        setTimeout(async () => {
          try {
            const [notificationsRes, unreadRes] = await Promise.all([
              axios.get(`http://localhost:5000/api/notifications/${userId}`),
              axios.get(`http://localhost:5000/api/notifications/unread/${userId}`)
            ]);

            setNotifications(notificationsRes.data);
            setUnreadCount(unreadRes.data.unreadCount);
            console.log('Notifications refreshed after bid acceptance');
          } catch (error) {
            console.error('Error refreshing notifications:', error);
          }
        }, 1000);
      }
    };

    const handleNewNotification = (data) => {
      console.log('🔔 New notification event received:', data);
      console.log('🔔 Current user ID:', userId);
      console.log('🔔 Notification user ID:', data.userId);
      console.log('🔔 Notification type:', data.notification?.type);
      
      if (data.userId === userId) {
        console.log('✅ Adding notification to UI:', data.notification);
        // Add the new notification to the current list
        setNotifications(prev => {
          const updated = [data.notification, ...prev];
          console.log('📋 Updated notifications list:', updated);
          return updated;
        });
        setUnreadCount(prev => {
          const newCount = prev + 1;
          console.log('🔢 Updated unread count:', newCount);
          return newCount;
        });
        console.log('✅ Notification added to UI for user:', userId);
      } else {
        console.log('❌ Notification not for this user, ignoring');
        console.log('❌ Expected userId:', userId, 'Received userId:', data.userId);
      }
    };

    const handleNewBidReceived = (data) => {
      console.log('New bid received event:', data);
      if (data.farmerId === userId) {
        console.log('New bid for this farmer, refreshing notifications');
        // Refresh notifications when a new bid is received for this farmer
        setTimeout(async () => {
          try {
            const [notificationsRes, unreadRes] = await Promise.all([
              axios.get(`http://localhost:5000/api/notifications/${userId}`),
              axios.get(`http://localhost:5000/api/notifications/unread/${userId}`)
            ]);

            setNotifications(notificationsRes.data);
            setUnreadCount(unreadRes.data.unreadCount);
            console.log('Notifications refreshed after new bid received');
          } catch (error) {
            console.error('Error refreshing notifications after new bid:', error);
          }
        }, 1000);
      }
    };

    socket.on('bidAccepted', handleBidAccepted);
    socket.on('newNotification', handleNewNotification);
    socket.on('newBidReceived', handleNewBidReceived);

    return () => {
      socket.off('bidAccepted', handleBidAccepted);
      socket.off('newNotification', handleNewNotification);
      socket.off('newBidReceived', handleNewBidReceived);
    };
  }, [user]);

  const handleClick = async (event) => {
    setAnchorEl(event.currentTarget);
    
    // Get user ID from Auth0 or localStorage (for farmers/merchants)
    const userId = user?.sub || localStorage.getItem('user_id');
    
    // Fetch latest notifications when opening
    if (!loading && userId) {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/notifications/${userId}`);
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/read/${notificationId}`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    // Get user ID from Auth0 or localStorage (for farmers/merchants)
    const userId = user?.sub || localStorage.getItem('user_id');
    if (!userId) return;
    
    try {
      await axios.put(`http://localhost:5000/api/notifications/read-all/${userId}`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const forceRefreshNotifications = async () => {
    // Get user ID from Auth0 or localStorage (for farmers/merchants)
    const userId = user?.sub || localStorage.getItem('user_id');
    if (!userId) return;
    
    setLoading(true);
    try {
      console.log('Force refreshing notifications for user:', userId);
      const [notificationsRes, unreadRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/notifications/${userId}`),
        axios.get(`http://localhost:5000/api/notifications/unread/${userId}`)
      ]);

      console.log('Force refresh - Notifications fetched:', notificationsRes.data);
      console.log('Force refresh - Unread count:', unreadRes.data.unreadCount);
      setNotifications(notificationsRes.data);
      setUnreadCount(unreadRes.data.unreadCount);
    } catch (error) {
      console.error('Error force refreshing notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'bid_accepted':
        return <CheckCircleIcon sx={{ color: '#4CAF50' }} />;
      case 'bid_rejected':
        return <CancelIcon sx={{ color: '#F44336' }} />;
      case 'booking_confirmed':
        return <CheckCircleIcon sx={{ color: '#4CAF50' }} />;
      case 'booking_rejected':
        return <CancelIcon sx={{ color: '#F44336' }} />;
      case 'payment_received':
        return <PaymentIcon sx={{ color: '#2196F3' }} />;
      case 'vehicle_booked':
        return <LocalShippingIcon sx={{ color: '#9C27B0' }} />;
      case 'message':
        return <ChatIcon sx={{ color: '#10B981' }} />;
      default:
        return <InfoIcon sx={{ color: '#FF9800' }} />;
    }
  };

  const handleNotificationClick = async (notification) => {
    // Use the enhanced utility function for handling navigation
    const { handleNotificationClick: handleClick } = await import('../hooks/useNotificationHandler');
    
    handleClick(notification, navigate, {
      markAsRead: !notification.isRead ? markAsRead : null,
      userRole: userRole,
      onError: (message) => {
        console.error('Navigation error:', message);
        alert(message); // Fallback error display
      }
    });

    // Close the notification popup
    handleClose();
  };

  const renderMessageNotification = (notification) => {
    const { metadata } = notification;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar
          src={metadata?.senderPicture}
          sx={{ 
            width: 32, 
            height: 32,
            border: '2px solid #10B981'
          }}
        >
          {metadata?.senderName?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: notification.isRead ? 400 : 600,
              color: '#374151',
              fontSize: '0.9rem'
            }}
          >
            {metadata?.senderName || 'Unknown User'}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontSize: '0.8rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {metadata?.messagePreview || notification.message}
          </Typography>
          {metadata?.senderRole && (
            <Chip
              label={metadata.senderRole}
              size="small"
              sx={{ 
                height: 16, 
                fontSize: '0.6rem', 
                mt: 0.5,
                backgroundColor: metadata.senderRole === 'farmer' ? '#059669' : 
                                metadata.senderRole === 'merchant' ? '#dc2626' : 
                                metadata.senderRole === 'transporter' ? '#2563eb' : '#6b7280',
                color: 'white',
                textTransform: 'capitalize'
              }}
            />
          )}
        </Box>
      </Box>
    );
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          mr: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            transform: 'scale(1.1)'
          }
        }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.75rem',
              fontWeight: 'bold',
              minWidth: '20px',
              height: '20px'
            }
          }}
        >
          <NotificationsIcon 
            sx={{ 
              color: unreadCount > 0 ? '#FF9800' : '#6B7280',
              fontSize: 28
            }} 
          />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 500,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
              Notifications
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={forceRefreshNotifications}
                disabled={loading}
                sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
              >
                🔄
              </Button>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  startIcon={<MarkEmailReadIcon />}
                  onClick={markAllAsRead}
                  sx={{ fontSize: '0.75rem' }}
                >
                  Mark all read
                </Button>
              )}
            </Box>
          </Box>

          {/* Notifications List */}
          {loading ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              Loading notifications...
            </Typography>
          ) : notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0, maxHeight: 350, overflow: 'auto' }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification._id}>
                  <ListItem
                    sx={{
                      backgroundColor: notification.isRead ? 'transparent' : '#FFF8EC',
                      borderRadius: 1,
                      mb: 0.5,
                      cursor: notification.isRead ? 'default' : 'pointer',
                      '&:hover': {
                        backgroundColor: notification.isRead ? '#F9FAFB' : '#FFF3CD'
                      }
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {notification.type === 'message' ? (
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            {renderMessageNotification(notification)}
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              {formatNotificationTime(notification.createdAt)}
                            </Typography>
                          </Box>
                        }
                      />
                    ) : (
                      <>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'transparent' }}>
                            {getNotificationIcon(notification.type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: notification.isRead ? 400 : 600,
                                  color: '#374151',
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
                            <Box sx={{ mt: 0.5 }}>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ fontSize: '0.85rem' }}
                              >
                                {notification.message}
                              </Typography>
                              {notification.metadata?.amount && (
                                <Chip
                                  label={`Rs. ${notification.metadata.amount}`}
                                  size="small"
                                  color="primary"
                                  sx={{ mt: 0.5, fontSize: '0.7rem', height: 20 }}
                                />
                              )}
                            </Box>
                          }
                        />
                      </>
                    )}
                  </ListItem>
                  {index < notifications.length - 1 && (
                    <Divider sx={{ my: 0.5 }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
