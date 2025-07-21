import { useCallback, useEffect } from 'react';

/**
 * Custom hook to integrate with RecentChats component
 * Provides methods to update recent chats from other components
 */
const useRecentChats = () => {
  // Check if the RecentChats API is available
  const isAPIAvailable = useCallback(() => {
    return window.recentChatsAPI && 
           typeof window.recentChatsAPI.addNewChat === 'function' &&
           typeof window.recentChatsAPI.updateChatMessage === 'function' &&
           typeof window.recentChatsAPI.clearUnreadCount === 'function';
  }, []);
  // Add a new chat to recent chats list
  const addNewChat = useCallback((chatData) => {
    if (isAPIAvailable()) {
      window.recentChatsAPI.addNewChat(chatData);
    } else {
      console.warn('⚠️ RecentChats API not available, storing for later use');
      // Store the request for when the API becomes available
      if (!window.pendingChatOperations) {
        window.pendingChatOperations = [];
      }
      window.pendingChatOperations.push({
        type: 'addNewChat',
        data: chatData
      });
    }
  }, [isAPIAvailable]);

  // Update a chat with new message
  const updateChatMessage = useCallback((userId, message, incrementUnread = false) => {
    if (isAPIAvailable()) {
      window.recentChatsAPI.updateChatMessage(userId, message, incrementUnread);
    } else {
      console.warn('⚠️ RecentChats API not available for updateChatMessage');
      // Store the request for when the API becomes available
      if (!window.pendingChatOperations) {
        window.pendingChatOperations = [];
      }
      window.pendingChatOperations.push({
        type: 'updateChatMessage',
        data: { userId, message, incrementUnread }
      });
    }
  }, [isAPIAvailable]);

  // Clear unread count for a specific chat
  const clearUnreadCount = useCallback((userId) => {
    if (isAPIAvailable()) {
      window.recentChatsAPI.clearUnreadCount(userId);
    } else {
      console.warn('⚠️ RecentChats API not available for clearUnreadCount');
      // Store the request for when the API becomes available
      if (!window.pendingChatOperations) {
        window.pendingChatOperations = [];
      }
      window.pendingChatOperations.push({
        type: 'clearUnreadCount',
        data: { userId }
      });
    }
  }, [isAPIAvailable]);

  // Listen for new messages and update recent chats
  const handleNewMessage = useCallback((messageData) => {
    const { senderId, receiverId, message, senderName, senderPicture, senderRole } = messageData;
    
    // If this is a received message (not sent by current user)
    if (senderId !== receiverId) {
      // Update the chat with new message and increment unread count
      updateChatMessage(senderId, message, true);
      
      // Add new chat if it doesn't exist
      addNewChat({
        userId: senderId,
        name: senderName,
        picture: senderPicture,
        role: senderRole,
        lastMessage: message,
        lastMessageTime: new Date().toISOString(),
        unreadCount: 1
      });
    }
  }, [updateChatMessage, addNewChat]);

  // Listen for sent messages and update recent chats
  const handleSentMessage = useCallback((messageData) => {
    const { receiverId, message, receiverName, receiverPicture, receiverRole } = messageData;
    
    // Update the chat with new message (no unread count increment for sent messages)
    updateChatMessage(receiverId, message, false);
    
    // Add new chat if it doesn't exist
    addNewChat({
      userId: receiverId,
      name: receiverName,
      picture: receiverPicture,
      role: receiverRole,
      lastMessage: message,
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0
    });
  }, [updateChatMessage, addNewChat]);

  // Register global event handlers for message updates
  useEffect(() => {
    // Create global message handlers
    window.recentChatsMessageHandlers = {
      handleNewMessage,
      handleSentMessage,
      clearUnreadCount
    };

    return () => {
      // Cleanup
      if (window.recentChatsMessageHandlers) {
        delete window.recentChatsMessageHandlers;
      }
    };
  }, [handleNewMessage, handleSentMessage, clearUnreadCount]);

  return {
    addNewChat,
    updateChatMessage,
    clearUnreadCount,
    handleNewMessage,
    handleSentMessage,
    isAPIAvailable
  };
};

export default useRecentChats;
