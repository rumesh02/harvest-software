/**
 * Test file for Recent Chats functionality
 * Run this in browser console to test the implementation
 */

// Test localStorage functionality
function testLocalStorageIntegration() {
  console.log('🧪 Testing localStorage integration...');
  
  const testUserId = 'test-user-123';
  const testChat = {
    userId: 'friend-456',
    name: 'Test Friend',
    picture: '',
    role: 'farmer',
    lastMessage: 'Hello test message',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 1
  };
  
  // Test saving
  const storageKey = `recentChats_${testUserId}`;
  localStorage.setItem(storageKey, JSON.stringify([testChat]));
  
  // Test loading
  const loaded = JSON.parse(localStorage.getItem(storageKey));
  console.log('✅ localStorage test passed:', loaded);
  
  // Cleanup
  localStorage.removeItem(storageKey);
}

// Test RecentChats API
function testRecentChatsAPI() {
  console.log('🧪 Testing RecentChats API...');
  
  if (window.recentChatsAPI) {
    console.log('✅ RecentChats API found:', Object.keys(window.recentChatsAPI));
    
    // Test adding a chat
    window.recentChatsAPI.addNewChat({
      userId: 'test-api-user',
      name: 'API Test User',
      role: 'merchant',
      lastMessage: 'API test message',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0
    });
    
    console.log('✅ Added test chat via API');
  } else {
    console.log('❌ RecentChats API not found');
  }
}

// Test message handlers
function testMessageHandlers() {
  console.log('🧪 Testing message handlers...');
  
  if (window.recentChatsMessageHandlers) {
    console.log('✅ Message handlers found:', Object.keys(window.recentChatsMessageHandlers));
    
    // Test handling a new message
    window.recentChatsMessageHandlers.handleNewMessage({
      senderId: 'sender-123',
      receiverId: 'current-user',
      message: 'Test incoming message',
      senderName: 'Test Sender',
      senderRole: 'transporter'
    });
    
    console.log('✅ Handled test incoming message');
  } else {
    console.log('❌ Message handlers not found');
  }
}

// Test error scenarios
function testErrorHandling() {
  console.log('🧪 Testing error handling...');
  
  // Test with null values
  try {
    if (window.recentChatsAPI) {
      window.recentChatsAPI.addNewChat(null);
      console.log('✅ Null safety test passed');
    }
  } catch (error) {
    console.log('❌ Null safety test failed:', error);
  }
  
  // Test with invalid data
  try {
    if (window.recentChatsAPI) {
      window.recentChatsAPI.updateChatMessage('', '', false);
      console.log('✅ Invalid data test passed');
    }
  } catch (error) {
    console.log('❌ Invalid data test failed:', error);
  }
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting Recent Chats Implementation Tests...\n');
  
  testLocalStorageIntegration();
  console.log('');
  
  testRecentChatsAPI();
  console.log('');
  
  testMessageHandlers();
  console.log('');
  
  testErrorHandling();
  console.log('');
  
  console.log('✅ All tests completed!');
}

// Export for manual testing
window.testRecentChats = {
  runAllTests,
  testLocalStorageIntegration,
  testRecentChatsAPI,
  testMessageHandlers,
  testErrorHandling
};

console.log('🧪 Recent Chats test utilities loaded. Run window.testRecentChats.runAllTests() to test.');
