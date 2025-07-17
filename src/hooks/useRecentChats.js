import { useCallback, useEffect } from 'react';

/**
 * Custom hook to integrate with RecentChats component
 * Provides methods to update recent chats from other components
 */
const useRecentChats = () => {
  // Add a new chat to recent chats list
  const addNewChat = useCallback((chatData) => {
    if (window.recentChatsAPI && window.recentChatsAPI.addNewChat) {
      window.recentChatsAPI.addNewChat(chatData);
    }
  }, []);

  // Update a chat with new message
  const updateChatMessage = useCallback((userId, message, incrementUnread = false) => {
    if (window.recentChatsAPI && window.recentChatsAPI.updateChatMessage) {
      window.recentChatsAPI.updateChatMessage(userId, message, incrementUnread);
    }
  }, []);

  // Clear unread count for a specific chat
  const clearUnreadCount = useCallback((userId) => {
    if (window.recentChatsAPI && window.recentChatsAPI.clearUnreadCount) {
      window.recentChatsAPI.clearUnreadCount(userId);
    }
  }, []);

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
    handleSentMessage
  };
};

export default useRecentChats;
