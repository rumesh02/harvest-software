/**
 * Handles notification click and navigates to the appropriate route
 * @param {Object} notification - The notification object
 * @param {Function} navigate - React Router's navigate function
 * @param {Object} options - Additional options
 * @param {Function} options.markAsRead - Optional callback to mark notification as read
 * @param {string} options.userRole - Current user role ('farmer', 'merchant', 'transporter')
 * @param {Function} options.onError - Optional error callback function
 */
export const handleNotificationClick = (notification, navigate, options = {}) => {
  const { markAsRead, userRole, onError } = options;

  // Mark as read if callback provided
  if (markAsRead && !notification.isRead) {
    markAsRead(notification._id);
  }

  // Extract notification data
  const { type, metadata, relatedId } = notification;
  const bidId = metadata?.bidId || relatedId;
  const itemId = metadata?.productId || metadata?.itemId;
  const chatUserId = metadata?.senderId;
  const vehicleId = metadata?.vehicleId;
  const bookingId = metadata?.bookingId;

  try {
    switch (type) {
      case 'newBid':
      case 'bid_received':
        // Navigate to my-bids page with specific item filter
        if (itemId) {
          navigate(`/farmer/accept-reject-bids?itemId=${itemId}`);
        } else {
          navigate('/farmer/accept-reject-bids');
        }
        break;

      case 'bidAccepted':
      case 'bid_accepted':
        // Navigate to harvest status page for merchants, or order page for farmers
        if (userRole === 'merchant' && bidId) {
          navigate(`/merchant/bids?bidId=${bidId}&status=accepted`);
        } else if (userRole === 'farmer' && bidId) {
          navigate(`/farmer/order?bidId=${bidId}`);
        } else {
          // Fallback to general pages
          navigate(userRole === 'merchant' ? '/merchant/bids' : '/farmer/order');
        }
        break;

      case 'bidRejected':
      case 'bid_rejected':
        // Navigate to my bids page for merchants
        if (userRole === 'merchant') {
          navigate('/merchant/bids?status=rejected');
        } else {
          navigate('/farmer/accept-reject-bids');
        }
        break;

      case 'paymentReceived':
      case 'payment_received':
      case 'order_confirmed':
        // Navigate to payments page
        if (userRole === 'merchant') {
          navigate('/merchant/payments');
        } else if (userRole === 'farmer') {
          navigate('/farmer/order');
        } else {
          // Fallback for other roles
          navigate('/payments');
        }
        break;

      case 'chatMessage':
      case 'message':
        // Navigate to chat with specific user
        if (chatUserId) {
          // Determine the correct messages route based on user role
          const messagesRoute = userRole === 'farmer' ? '/farmer/messages' : 
                               userRole === 'merchant' ? '/merchant/messages' :
                               userRole === 'transporter' ? '/transporter/inbox' : '/messages';
          
          navigate(`${messagesRoute}?chatWith=${chatUserId}`);
        } else {
          // Fallback to general messages page
          const messagesRoute = userRole === 'farmer' ? '/farmer/messages' : 
                               userRole === 'merchant' ? '/merchant/messages' :
                               userRole === 'transporter' ? '/transporter/inbox' : '/messages';
          navigate(messagesRoute);
        }
        break;

      case 'vehicle_booked':
      case 'vehicleBooked':
        // Navigate to bookings or vehicle management
        if (userRole === 'transporter') {
          navigate(`/transporter/bookings${bookingId ? `?bookingId=${bookingId}` : ''}`);
        } else if (userRole === 'merchant') {
          navigate('/merchant/find-vehicles');
        } else {
          navigate('/transporter/bookings');
        }
        break;

      case 'vehicleStatusUpdate':
        // Navigate to bookings with specific vehicle
        if (userRole === 'transporter' && vehicleId) {
          navigate(`/transporter/editListed?vehicleId=${vehicleId}`);
        } else {
          navigate('/transporter/bookings');
        }
        break;

      case 'general':
      default:
        // For general notifications, navigate to dashboard
        const dashboardRoute = userRole === 'farmer' ? '/farmer' : 
                              userRole === 'merchant' ? '/merchant/dashboard' :
                              userRole === 'transporter' ? '/transporter/dashboard' : '/';
        navigate(dashboardRoute);
        break;
    }

    // Log successful navigation
    console.log(`📱 Navigated for notification type: ${type}`, {
      notificationId: notification._id,
      type,
      metadata,
      userRole
    });

  } catch (error) {
    console.error('❌ Error handling notification click:', error);
    
    // Call error callback if provided, otherwise show alert
    if (onError) {
      onError('Unable to navigate to the requested page');
    } else {
      alert('Unable to navigate to the requested page');
    }
    
    // Safe fallback navigation
    const fallbackRoute = userRole === 'farmer' ? '/farmer' : 
                         userRole === 'merchant' ? '/merchant/dashboard' :
                         userRole === 'transporter' ? '/transporter/dashboard' : '/';
    navigate(fallbackRoute);
  }
};

/**
 * Get display metadata for notification
 * @param {Object} notification - The notification object
 * @returns {Object} Display metadata with icon, color, etc.
 */
export const getNotificationDisplayData = (notification) => {
  const { type } = notification;
  
  const displayMap = {
    'newBid': {
      icon: 'TrendingUp',
      color: '#2196F3',
      bgColor: '#E3F2FD',
      actionText: 'View Bid'
    },
    'bid_received': {
      icon: 'TrendingUp',
      color: '#2196F3',
      bgColor: '#E3F2FD',
      actionText: 'View Bid'
    },
    'bidAccepted': {
      icon: 'CheckCircle',
      color: '#4CAF50',
      bgColor: '#E8F5E8',
      actionText: 'View Order'
    },
    'bid_accepted': {
      icon: 'CheckCircle',
      color: '#4CAF50',
      bgColor: '#E8F5E8',
      actionText: 'View Order'
    },
    'bidRejected': {
      icon: 'Cancel',
      color: '#F44336',
      bgColor: '#FFEBEE',
      actionText: 'View Bids'
    },
    'bid_rejected': {
      icon: 'Cancel',
      color: '#F44336',
      bgColor: '#FFEBEE',
      actionText: 'View Bids'
    },
    'paymentReceived': {
      icon: 'Payment',
      color: '#FF9800',
      bgColor: '#FFF3E0',
      actionText: 'View Payment'
    },
    'payment_received': {
      icon: 'Payment',
      color: '#FF9800',
      bgColor: '#FFF3E0',
      actionText: 'View Payment'
    },
    'order_confirmed': {
      icon: 'CheckCircle',
      color: '#4CAF50',
      bgColor: '#E8F5E8',
      actionText: 'View Order'
    },
    'chatMessage': {
      icon: 'Chat',
      color: '#9C27B0',
      bgColor: '#F3E5F5',
      actionText: 'Open Chat'
    },
    'message': {
      icon: 'Chat',
      color: '#9C27B0',
      bgColor: '#F3E5F5',
      actionText: 'Open Chat'
    },
    'vehicle_booked': {
      icon: 'LocalShipping',
      color: '#607D8B',
      bgColor: '#ECEFF1',
      actionText: 'View Booking'
    },
    'vehicleBooked': {
      icon: 'LocalShipping',
      color: '#607D8B',
      bgColor: '#ECEFF1',
      actionText: 'View Booking'
    },
    'vehicleStatusUpdate': {
      icon: 'LocalShipping',
      color: '#607D8B',
      bgColor: '#ECEFF1',
      actionText: 'View Vehicle'
    },
    'general': {
      icon: 'Info',
      color: '#757575',
      bgColor: '#F5F5F5',
      actionText: 'View Details'
    }
  };

  return displayMap[type] || displayMap['general'];
};

/**
 * Format notification time for display
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted time string
 */
export const formatNotificationTime = (timestamp) => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return notificationTime.toLocaleDateString();
};

/**
 * Get notification priority for sorting
 * @param {Object} notification - The notification object
 * @returns {number} Priority number (lower = higher priority)
 */
export const getNotificationPriority = (notification) => {
  const priorityMap = {
    'bidAccepted': 1,
    'bid_accepted': 1,
    'paymentReceived': 2,
    'payment_received': 2,
    'order_confirmed': 2,
    'newBid': 3,
    'bid_received': 3,
    'chatMessage': 4,
    'message': 4,
    'vehicle_booked': 5,
    'vehicleBooked': 5,
    'bidRejected': 6,
    'bid_rejected': 6,
    'vehicleStatusUpdate': 7,
    'general': 8
  };
  
  return priorityMap[notification.type] || 9;
};
