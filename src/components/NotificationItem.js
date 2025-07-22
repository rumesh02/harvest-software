import React from 'react';
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Chip,
  Box,
  IconButton
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
  formatNotificationTime
} from '../utils/notificationUtils';

/**
 * Individual notification item component
 */
const NotificationItem = ({ 
  notification,
  onMarkAsRead,
  userRole = 'farmer',
  showActions = true,
  onClick,
  ...listItemProps
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

  const displayData = getNotificationDisplayData(notification);

  // Handle click
  const handleClick = (e) => {
    if (onClick) {
      onClick(notification, e);
    } else {
      handleNotificationClick(notification, navigate, {
        markAsRead: onMarkAsRead,
        userRole: userRole
      });
    }
  };

  return (
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
        py: 2,
        ...listItemProps.sx
      }}
      onClick={handleClick}
      {...listItemProps}
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
              // Add custom actions here
            }}
            sx={{ opacity: 0.6 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </ListItem>
  );
};

export default NotificationItem;

/**
 * Example usage:
 * 
 * import NotificationItem from './NotificationItem';
 * 
 * function MyComponent() {
 *   const userRole = localStorage.getItem('userRole');
 * 
 *   const handleMarkAsRead = async (notificationId) => {
 *     // Mark notification as read logic
 *   };
 * 
 *   const handleCustomClick = (notification, event) => {
 *     // Custom click handling
 *     console.log('Custom click:', notification);
 *   };
 * 
 *   return (
 *     <NotificationItem
 *       notification={notification}
 *       onMarkAsRead={handleMarkAsRead}
 *       userRole={userRole}
 *       showActions={true}
 *       onClick={handleCustomClick} // Optional custom click handler
 *     />
 *   );
 * }
 */
