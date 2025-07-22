import { handleNotificationClick } from '../hooks/useNotificationHandler';

/**
 * Test utility for debugging notification navigation
 */
export const testNotificationNavigation = () => {
  const mockNavigate = (route) => {
    console.log(`🔗 Would navigate to: ${route}`);
  };

  const testNotifications = [
    {
      _id: 'test-1',
      type: 'newBid',
      title: 'New Bid Received',
      message: 'You have received a new bid',
      metadata: { itemId: 'item-123', productName: 'Tomatoes' },
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'test-2',
      type: 'bid_received',
      title: 'Bid Received',
      message: 'A merchant placed a bid on your product',
      metadata: { itemId: 'item-456', bidId: 'bid-789' },
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'test-3',
      type: 'bidAccepted',
      title: 'Bid Accepted',
      message: 'Your bid has been accepted',
      metadata: { bidId: 'bid-123' },
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'test-4',
      type: 'chatMessage',
      title: 'New Message',
      message: 'You have a new message',
      metadata: { senderId: 'user-456' },
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ];

  console.log('🧪 Testing notification navigation...\n');

  // Test farmer routes
  console.log('👨‍🌾 FARMER ROUTES:');
  testNotifications.forEach(notification => {
    console.log(`\n📱 Testing: ${notification.type}`);
    handleNotificationClick(notification, mockNavigate, {
      userRole: 'farmer',
      markAsRead: (id) => console.log(`✅ Marked as read: ${id}`),
      onError: (error) => console.error(`❌ Error: ${error}`)
    });
  });

  // Test merchant routes
  console.log('\n\n🏪 MERCHANT ROUTES:');
  testNotifications.forEach(notification => {
    console.log(`\n📱 Testing: ${notification.type}`);
    handleNotificationClick(notification, mockNavigate, {
      userRole: 'merchant',
      markAsRead: (id) => console.log(`✅ Marked as read: ${id}`),
      onError: (error) => console.error(`❌ Error: ${error}`)
    });
  });

  // Test transporter routes
  console.log('\n\n🚚 TRANSPORTER ROUTES:');
  testNotifications.forEach(notification => {
    console.log(`\n📱 Testing: ${notification.type}`);
    handleNotificationClick(notification, mockNavigate, {
      userRole: 'transporter',
      markAsRead: (id) => console.log(`✅ Marked as read: ${id}`),
      onError: (error) => console.error(`❌ Error: ${error}`)
    });
  });

  console.log('\n✅ Testing complete!');
};

/**
 * Test specific notification type
 * @param {string} type - Notification type to test
 * @param {Object} metadata - Test metadata
 * @param {string} userRole - User role to test
 */
export const testSpecificNotification = (type, metadata = {}, userRole = 'farmer') => {
  const mockNavigate = (route) => {
    console.log(`🔗 [${userRole.toUpperCase()}] ${type} → ${route}`);
  };

  const testNotification = {
    _id: `test-${type}`,
    type: type,
    title: `Test ${type}`,
    message: `Testing ${type} notification`,
    metadata: metadata,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  handleNotificationClick(testNotification, mockNavigate, {
    userRole,
    markAsRead: (id) => console.log(`✅ Marked as read: ${id}`),
    onError: (error) => console.error(`❌ Error: ${error}`)
  });
};

// Quick test for farmer bid notifications
export const testFarmerBidNotification = () => {
  console.log('🧪 Testing farmer bid notification...');
  
  testSpecificNotification('newBid', { 
    itemId: 'item-123', 
    productName: 'Organic Tomatoes' 
  }, 'farmer');
  
  testSpecificNotification('bid_received', { 
    itemId: 'item-456', 
    bidId: 'bid-789' 
  }, 'farmer');
};

/**
 * Usage in console:
 * 
 * import { testNotificationNavigation, testFarmerBidNotification } from './utils/testNotifications';
 * 
 * // Test all notifications
 * testNotificationNavigation();
 * 
 * // Test farmer bid notifications specifically
 * testFarmerBidNotification();
 * 
 * // Test specific notification
 * testSpecificNotification('newBid', { itemId: 'item-123' }, 'farmer');
 */
