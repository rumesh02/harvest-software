import React, { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 * Maps notification types to their corresponding route handlers with role-based navigation.
 */
const getNotificationRoute = (type, payload = {}, userRole = 'farmer') => {
  const { itemId, bidId, chatUserId, vehicleId, bookingId, productId } = payload;
  
  console.log('🔍 DEBUG: getNotificationRoute called with:', {
    type: type,
    payload: payload,
    userRole: userRole,
    extractedIds: { itemId, bidId, chatUserId, vehicleId, bookingId, productId }
  });
  
  // Special debug for chat-related notifications
  if (type?.includes('message') || type?.includes('chat')) {
    console.log('💬 DEBUG: Chat notification detected:', {
      type: type,
      chatUserId: chatUserId,
      payloadKeys: Object.keys(payload),
      allChatFields: {
        senderId: payload.senderId,
        userId: payload.userId,
        fromUserId: payload.fromUserId,
        chatUserId: payload.chatUserId
      }
    });
  }
  
  // Special handling for 'general' type notifications that are actually bid-related
  let actualType = type;
  if (type === 'general' && payload.bidId && payload.merchantId) {
    // This is likely a new bid notification for farmer
    actualType = 'newBid';
    console.log('🔍 DEBUG: Detected general notification as newBid based on metadata');
  }
  
  const routeMap = {
    // Bid-related notifications
    newBid: {
      farmer: itemId ? `/accept-reject-bids?itemId=${itemId}` : '/accept-reject-bids',
      merchant: '/merchant/bids',
      transporter: '/transporter/dashboard'
    },
    bid_received: {
      farmer: itemId ? `/accept-reject-bids?itemId=${itemId}` : '/accept-reject-bids',
      merchant: '/merchant/bids',
      transporter: '/transporter/dashboard'
    },
    
    bidAccepted: {
      farmer: bidId ? `/order?bidId=${bidId}` : '/order',
      merchant: bidId ? `/merchant/bids?bidId=${bidId}&status=accepted` : '/merchant/bids?status=accepted',
      transporter: '/transporter/dashboard'
    },
    bid_accepted: {
      farmer: bidId ? `/order?bidId=${bidId}` : '/order',
      merchant: bidId ? `/merchant/bids?bidId=${bidId}&status=accepted` : '/merchant/bids?status=accepted',
      transporter: '/transporter/dashboard'
    },
    
    bidRejected: {
      farmer: '/accept-reject-bids',
      merchant: '/merchant/bids?status=rejected',
      transporter: '/transporter/dashboard'
    },
    bid_rejected: {
      farmer: '/accept-reject-bids',
      merchant: '/merchant/bids?status=rejected',
      transporter: '/transporter/dashboard'
    },
    
    // Payment-related notifications
    paymentReceived: {
      farmer: '/order',
      merchant: '/merchant/payments',
      transporter: '/transporter/dashboard'
    },
    payment_received: {
      farmer: '/order',
      merchant: '/merchant/payments',
      transporter: '/transporter/dashboard'
    },
    order_confirmed: {
      farmer: '/order',
      merchant: '/merchant/payments',
      transporter: '/transporter/dashboard'
    },
    
    // Chat/Message notifications
    chatMessage: {
      farmer: chatUserId ? `/messages?chatWith=${chatUserId}` : '/messages',
      merchant: chatUserId ? `/merchant/messages?chatWith=${chatUserId}` : '/merchant/messages',
      transporter: chatUserId ? `/transporter/inbox?chatWith=${chatUserId}` : '/transporter/inbox'
    },
    message: {
      farmer: chatUserId ? `/messages?chatWith=${chatUserId}` : '/messages',
      merchant: chatUserId ? `/merchant/messages?chatWith=${chatUserId}` : '/merchant/messages',
      transporter: chatUserId ? `/transporter/inbox?chatWith=${chatUserId}` : '/transporter/inbox'
    },
    new_message: {
      farmer: chatUserId ? `/messages?chatWith=${chatUserId}` : '/messages',
      merchant: chatUserId ? `/merchant/messages?chatWith=${chatUserId}` : '/merchant/messages',
      transporter: chatUserId ? `/transporter/inbox?chatWith=${chatUserId}` : '/transporter/inbox'
    },
    chat: {
      farmer: chatUserId ? `/messages?chatWith=${chatUserId}` : '/messages',
      merchant: chatUserId ? `/merchant/messages?chatWith=${chatUserId}` : '/merchant/messages',
      transporter: chatUserId ? `/transporter/inbox?chatWith=${chatUserId}` : '/transporter/inbox'
    },
    
    // Vehicle/Transport notifications
    vehicle_booked: {
      farmer: '/',
      merchant: '/merchant/find-vehicles',
      transporter: bookingId ? `/transporter/bookings?bookingId=${bookingId}` : '/transporter/bookings'
    },
    vehicleBooked: {
      farmer: '/',
      merchant: '/merchant/find-vehicles',
      transporter: bookingId ? `/transporter/bookings?bookingId=${bookingId}` : '/transporter/bookings'
    },
    vehicleStatusUpdate: {
      farmer: '/',
      merchant: '/merchant/find-vehicles',
      transporter: vehicleId ? `/transporter/editListed?vehicleId=${vehicleId}` : '/transporter/editListed'
    },
    
    // Collection notifications
    collection_update: {
      farmer: '/order',
      merchant: '/merchant/collection',
      transporter: '/transporter/bookings'
    },
    
    // General notifications - now with enhanced detection
    general: {
      farmer: (payload.bidId && payload.merchantId) ? '/accept-reject-bids' : '/',
      merchant: '/merchant/dashboard',
      transporter: '/transporter/dashboard'
    }
  };
  
  // Get route for the specific type and role
  const typeRoutes = routeMap[actualType]; // Use actualType instead of type
  
  console.log('🔍 DEBUG: Route mapping result:', {
    originalType: type,
    actualType: actualType,
    typeRoutes: typeRoutes,
    userRole: userRole,
    availableTypes: Object.keys(routeMap)
  });
  
  if (!typeRoutes) {
    console.log('🔍 DEBUG: Type not found, using general fallback');
    const generalRoute = routeMap.general[userRole];
    return typeof generalRoute === 'function' ? generalRoute(payload) : generalRoute || '/';
  }
  
  const selectedRoute = typeRoutes[userRole] || typeRoutes.farmer || '/';
  const finalRoute = typeof selectedRoute === 'function' ? selectedRoute(payload) : selectedRoute;
  
  console.log('🔍 DEBUG: Final route selected:', finalRoute);
  
  return finalRoute;
};

/**
 * Handles navigation based on notification type and payload.
 * @param {Object} notification - Notification object with type, metadata, etc.
 * @param {Function} navigate - React Router navigation function
 * @param {Object} options - Extra options including userRole, markAsRead, onError
 */
export const handleNotificationClick = (notification, navigate, options = {}) => {
  const { type, metadata = {}, payload = {}, relatedId } = notification || {};
  const { markAsRead, userRole = 'farmer', onError } = options;

  // Enhanced debugging
  console.log('🔍 DEBUG: Notification click handler called with:', {
    notification: notification,
    type: type,
    metadata: metadata,
    payload: payload,
    relatedId: relatedId,
    userRole: userRole
  });

  // Combine metadata and payload for backward compatibility
  const combinedPayload = {
    ...payload,
    ...metadata,
    itemId: metadata?.itemId || metadata?.productId || payload?.itemId || relatedId,
    bidId: metadata?.bidId || relatedId || payload?.bidId,
    chatUserId: metadata?.senderId || metadata?.userId || metadata?.fromUserId || metadata?.chatUserId || payload?.chatUserId || payload?.senderId || payload?.userId || payload?.fromUserId,
    vehicleId: metadata?.vehicleId || payload?.vehicleId,
    bookingId: metadata?.bookingId || payload?.bookingId,
    merchantId: metadata?.merchantId || payload?.merchantId
  };

  console.log('🔍 DEBUG: Combined payload:', combinedPayload);

  if (!type) {
    console.error('❌ DEBUG: Missing notification type');
    onError?.('Missing notification type');
    return;
  }

  try {
    // Call markAsRead if provided and notification is unread
    if (markAsRead && typeof markAsRead === 'function' && !notification.isRead) {
      markAsRead(notification._id || notification.id);
    }

    // Get the appropriate route based on type, payload, and user role
    const route = getNotificationRoute(type, combinedPayload, userRole);

    console.log('🔍 DEBUG: Generated route:', route);

    if (!route) {
      console.error('❌ DEBUG: Failed to resolve route');
      onError?.(`Failed to resolve route for type: ${type}`);
      return;
    }

    console.log(`🔗 Navigating to: ${route}`, {
      type,
      userRole,
      payload: combinedPayload,
      notificationId: notification._id
    });

    navigate(route);
  } catch (err) {
    console.error('❌ Notification navigation error:', err);
    onError?.(`Error processing notification: ${err.message}`);
    
    // Fallback to dashboard
    const fallbackRoute = userRole === 'farmer' ? '/' : 
                         userRole === 'merchant' ? '/merchant/dashboard' :
                         userRole === 'transporter' ? '/transporter/dashboard' : '/';
    navigate(fallbackRoute);
  }
};

/**
 * Hook for handling notifications with MUI Snackbar
 * @param {string} userRole - Current user role ('farmer', 'merchant', 'transporter')
 * @returns {Object} - Notification handler and Snackbar component
 */
export const useNotificationHandler = (userRole = 'farmer') => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleNotificationClickWithSnackbar = (notification, markAsRead) => {
    handleNotificationClick(notification, navigate, {
      markAsRead,
      userRole,
      onError: (message) => {
        setSnackbar({
          open: true,
          message,
          severity: 'error'
        });
      }
    });
  };

  const showSuccessMessage = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'success'
    });
  };

  const showErrorMessage = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'error'
    });
  };

  const showInfoMessage = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'info'
    });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const SnackbarComponent = () => (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={closeSnackbar}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={closeSnackbar} 
        severity={snackbar.severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );

  return {
    handleNotificationClick: handleNotificationClickWithSnackbar,
    showSuccessMessage,
    showErrorMessage,
    showInfoMessage,
    SnackbarComponent
  };
};

/**
 * Get notification display properties for UI rendering
 * @param {Object} notification - The notification object
 * @returns {Object} Display properties including icon, color, priority
 */
export const getNotificationDisplayProps = (notification) => {
  const { type } = notification;
  
  const displayMap = {
    'newBid': { icon: '💰', color: '#2196F3', priority: 3, actionText: 'View Bid' },
    'bid_received': { icon: '💰', color: '#2196F3', priority: 3, actionText: 'View Bid' },
    'bidAccepted': { icon: '✅', color: '#4CAF50', priority: 1, actionText: 'View Order' },
    'bid_accepted': { icon: '✅', color: '#4CAF50', priority: 1, actionText: 'View Order' },
    'bidRejected': { icon: '❌', color: '#F44336', priority: 6, actionText: 'View Bids' },
    'bid_rejected': { icon: '❌', color: '#F44336', priority: 6, actionText: 'View Bids' },
    'paymentReceived': { icon: '💳', color: '#FF9800', priority: 2, actionText: 'View Payment' },
    'payment_received': { icon: '💳', color: '#FF9800', priority: 2, actionText: 'View Payment' },
    'order_confirmed': { icon: '📦', color: '#4CAF50', priority: 2, actionText: 'View Order' },
    'chatMessage': { icon: '💬', color: '#9C27B0', priority: 4, actionText: 'Open Chat' },
    'message': { icon: '💬', color: '#9C27B0', priority: 4, actionText: 'Open Chat' },
    'new_message': { icon: '💬', color: '#9C27B0', priority: 4, actionText: 'Open Chat' },
    'chat': { icon: '💬', color: '#9C27B0', priority: 4, actionText: 'Open Chat' },
    'vehicle_booked': { icon: '🚚', color: '#607D8B', priority: 5, actionText: 'View Booking' },
    'vehicleBooked': { icon: '🚚', color: '#607D8B', priority: 5, actionText: 'View Booking' },
    'vehicleStatusUpdate': { icon: '🔄', color: '#607D8B', priority: 7, actionText: 'View Vehicle' },
    'collection_update': { icon: '📋', color: '#795548', priority: 5, actionText: 'View Collection' },
    'general': { icon: 'ℹ️', color: '#757575', priority: 8, actionText: 'View Details' }
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
