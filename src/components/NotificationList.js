import React from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Chip,
  Box,
  IconButton,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
  Info as InfoIcon,
  LocalShipping as LocalShippingIcon,
  Chat as ChatIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  handleNotificationClick,
  getNotificationDisplayData,
  formatNotificationTime,
  getNotificationPriority
} from '../utils/notificationUtils';

/**
 * Example NotificationList component that demonstrates how to use the notification utilities
 */
const NotificationList = ({ 
  notifications = [], 
  onMarkAsRead, 
  userRole = 'farmer',
  showActions = true 
}) => {
  const navigate = useNavigate();

  // Get icon component based on notification type
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
      'general': <InfoIcon />
    };
    
    return iconMap[type] || <InfoIcon />;
  };

  // Handle notification click with our utility
  const handleNotificationItemClick = (notification) => {
    handleNotificationClick(notification, navigate, {
      markAsRead: onMarkAsRead,
      userRole: userRole
    });
  };

  // Sort notifications by priority and read status
  const sortedNotifications = [...notifications].sort((a, b) => {
    // Unread notifications first
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }
    
    // Then by priority
    const priorityDiff = getNotificationPriority(a) - getNotificationPriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    
    // Finally by timestamp (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (!notifications.length) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 6,
        color: 'text.secondary'
      }}>
        <InfoIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" gutterBottom>
          No notifications
        </Typography>
        <Typography variant="body2">
          You'll see notifications here when there's activity on your account
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', p: 0 }}>
      {sortedNotifications.map((notification, index) => {
        const displayData = getNotificationDisplayData(notification);
        
        return (
          <React.Fragment key={notification._id}>
            <ListItem
              sx={{
                backgroundColor: notification.isRead ? 'transparent' : 'rgba(76, 175, 80, 0.04)',
                borderLeft: notification.isRead ? 'none' : '4px solid #4CAF50',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: notification.isRead ? 'rgba(0,0,0,0.02)' : 'rgba(76, 175, 80, 0.08)',
                  transform: 'translateX(2px)'
                },
                py: 2
              }}
              onClick={() => handleNotificationItemClick(notification)}
            >
              <ListItemAvatar>
                <Avatar 
                  sx={{ 
                    bgcolor: displayData.bgColor,
                    color: displayData.color,
                    width: 48,
                    height: 48
                  }}
                >
                  {getNotificationIcon(notification.type)}
                </Avatar>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                  <Box sx={{ mt: 0.5 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {notification.message}
                    </Typography>
                    
                    {/* Show metadata chips */}
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
                          color="success"
                          sx={{ 
                            fontSize: '0.7rem', 
                            height: 20,
                            fontWeight: 600
                          }}
                        />
                      )}
                      
                      <Chip
                        label={displayData.actionText}
                        size="small"
                        variant="filled"
                        sx={{ 
                          fontSize: '0.7rem',
                          bgcolor: displayData.color,
                          color: 'white',
                          fontWeight: 500
                        }}
                      />
                    </Box>
                  </Box>
                }
              />
              
              {showActions && (
                <Box sx={{ ml: 1 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add menu or additional actions here
                    }}
                    sx={{ opacity: 0.6 }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </ListItem>
            
            {index < sortedNotifications.length - 1 && (
              <Divider variant="inset" component="li" />
            )}
          </React.Fragment>
        );
      })}
    </List>
  );
};

export default NotificationList;

/**
 * Example usage:
 * 
 * import NotificationList from './NotificationList';
 * 
 * function MyComponent() {
 *   const [notifications, setNotifications] = useState([]);
 *   const userRole = localStorage.getItem('userRole');
 * 
 *   const handleMarkAsRead = async (notificationId) => {
 *     try {
 *       await axios.put(`/api/notifications/read/${notificationId}`);
 *       setNotifications(prev => 
 *         prev.map(n => n._id === notificationId ? {...n, isRead: true} : n)
 *       );
 *     } catch (error) {
 *       console.error('Error marking notification as read:', error);
 *     }
 *   };
 * 
 *   return (
 *     <NotificationList
 *       notifications={notifications}
 *       onMarkAsRead={handleMarkAsRead}
 *       userRole={userRole}
 *       showActions={true}
 *     />
 *   );
 * }
 */
