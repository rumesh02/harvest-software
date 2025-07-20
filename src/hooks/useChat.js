import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

export const useChat = (currentUserId, targetUserId, targetUser) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  
  const typingTimeoutRef = useRef(null);

  // Load messages for conversation
  const loadMessagesForConversation = async (user1, user2) => {
    try {
      console.log('🔄 Loading conversation between:', { user1, user2 });
      
      const response = await axios.get(`http://localhost:5000/api/messages/${user1}/${user2}`);
      console.log('📥 API Response:', response.data);
      
      // Handle both possible response formats
      let messagesData;
      if (response.data.success && response.data.messages) {
        messagesData = response.data.messages;
      } else if (Array.isArray(response.data)) {
        messagesData = response.data;
      } else {
        console.error('🔴 Unexpected API response format:', response.data);
        messagesData = [];
      }
      
      console.log('📋 Raw messages data:', messagesData);
      
      // Filter and sort messages
      const filteredMessages = messagesData.filter(msg => {
        const isValidMessage = (
          (msg.senderId === user1 && msg.receiverId === user2) ||
          (msg.senderId === user2 && msg.receiverId === user1)
        );
        
        if (!isValidMessage) {
          console.log('🚫 Filtering out message:', {
            messageId: msg._id,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            expectedUsers: { user1, user2 }
          });
        }
        
        return isValidMessage;
      });
      
      console.log('🔍 Filtered messages:', filteredMessages.length, 'out of', messagesData.length);
      
      const sortedMessages = filteredMessages.sort((a, b) => {
        const timeA = new Date(a.timestamp || a.createdAt || 0);
        const timeB = new Date(b.timestamp || b.createdAt || 0);
        return timeA - timeB;
      });
      
      const processedMessages = sortedMessages.map(msg => ({
        ...msg,
        status: msg.senderId === user1 ? 'read' : 'received'
      }));
      
      setMessages(processedMessages);
      setLoading(false);
      
      console.log('✅ Messages loaded successfully:', {
        total: processedMessages.length,
        sample: processedMessages.slice(0, 3).map(m => ({
          id: m._id,
          sender: m.senderId,
          receiver: m.receiverId,
          message: m.message?.substring(0, 50) + '...',
          timestamp: m.timestamp || m.createdAt
        }))
      });
      
    } catch (error) {
      console.error('🔴 Error fetching messages:', error);
      setMessages([]);
      setLoading(false);
    }
  };

  // Mark message notifications as read
  const markMessageNotificationsAsRead = async () => {
    if (!currentUserId || !targetUserId) return;
    
    try {
      await axios.put(`http://localhost:5000/api/notifications/read-messages/${currentUserId}/${targetUserId}`);
    } catch (error) {
      console.error('Error marking message notifications as read:', error);
    }
  };

  // Send message
  const sendMessage = async (messageText) => {
    if (!messageText.trim() || sending) return;

    setSending(true);
    const tempId = Date.now();
    
    const messageData = {
      id: tempId,
      senderId: currentUserId,
      receiverId: targetUserId,
      message: messageText.trim(),
      timestamp: new Date(),
      senderName: targetUser?.name || 'Unknown User',
      status: 'sending'
    };

    // Add message immediately with sending status
    setMessages(prev => [...prev, messageData]);

    // Stop typing indicator
    socket.emit('typing', {
      senderId: currentUserId,
      receiverId: targetUserId,
      typing: false
    });

    try {
      // Emit to socket
      socket.emit('sendMessage', messageData);
      
      // Update status to sent
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: 'sent' } : msg
      ));
      
      // Update RecentChats with sent message
      if (window.recentChatsMessageHandlers?.handleSentMessage) {
        window.recentChatsMessageHandlers.handleSentMessage({
          receiverId: targetUserId,
          message: messageText,
          receiverName: targetUser?.name,
          receiverPicture: targetUser?.picture,
          receiverRole: targetUser?.role
        });
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Update status to failed
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: 'failed' } : msg
      ));
    } finally {
      setSending(false);
    }
  };

  // Handle typing
  const handleTyping = (isTyping) => {
    socket.emit('typing', {
      senderId: currentUserId,
      receiverId: targetUserId,
      typing: isTyping
    });

    if (isTyping) {
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', {
          senderId: currentUserId,
          receiverId: targetUserId,
          typing: false
        });
      }, 1000);
    }
  };

  // Load chat history on mount
  useEffect(() => {
    console.log('🔄 useChat effect triggered:', { currentUserId, targetUserId });
    
    if (!currentUserId || !targetUserId) {
      console.log('⚠️ Missing user IDs, clearing messages');
      setMessages([]);
      setLoading(false);
      return;
    }
    
    if (currentUserId === targetUserId) {
      console.error('❌ Error: currentUserId and targetUserId are the same!', { currentUserId, targetUserId });
      setMessages([]);
      setLoading(false);
      return;
    }
    
    setMessages([]);
    setLoading(true);
    loadMessagesForConversation(currentUserId, targetUserId);
    markMessageNotificationsAsRead();
  }, [currentUserId, targetUserId]);

  // Socket setup
  useEffect(() => {
    if (!currentUserId || !targetUserId) return;

    console.log('🔵 Setting up socket for chat between:', { currentUserId, targetUserId });

    // Clean up existing listeners
    socket.off('receiveMessage');
    socket.off('userTyping');
    socket.off('userOnline');

    // Join room
    socket.emit('joinRoom', { senderId: currentUserId, receiverId: targetUserId });
    socket.emit('join', currentUserId);

    // Message handler
    const messageHandler = (message) => {
      const isValidMessage = (
        (message.senderId === currentUserId && message.receiverId === targetUserId) ||
        (message.senderId === targetUserId && message.receiverId === currentUserId)
      );
      
      if (isValidMessage) {
        setMessages(prev => {
          // Prevent duplicates
          const messageExists = prev.some(msg => 
            msg._id === message._id || 
            (msg.senderId === message.senderId && 
             msg.receiverId === message.receiverId && 
             msg.message === message.message && 
             Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 1000)
          );
          
          if (messageExists) return prev;
          
          return [...prev, {
            ...message,
            status: message.senderId === currentUserId ? 'sent' : 'received'
          }];
        });
        
        // Mark as read if receiver
        if (message.receiverId === currentUserId) {
          axios.put(`http://localhost:5000/api/messages/read/${currentUserId}/${message.senderId}`)
            .catch(err => console.error('Error marking message as read:', err));
        }
      }
    };

    const typingHandler = ({ userId, typing: isTyping }) => {
      if (userId === targetUserId) {
        setTyping(isTyping);
      }
    };

    const onlineHandler = ({ userId, online }) => {
      if (userId === targetUserId) {
        setIsOnline(online);
        if (!online) {
          setLastSeen(new Date());
        }
      }
    };

    // Set up listeners
    socket.on('receiveMessage', messageHandler);
    socket.on('userTyping', typingHandler);
    socket.on('userOnline', onlineHandler);

    return () => {
      socket.off('receiveMessage', messageHandler);
      socket.off('userTyping', typingHandler);
      socket.off('userOnline', onlineHandler);
    };
  }, [currentUserId, targetUserId]);

  // Clear unread count
  useEffect(() => {
    if (!targetUserId) return;
    
    if (window.recentChatsMessageHandlers?.clearUnreadCount) {
      window.recentChatsMessageHandlers.clearUnreadCount(targetUserId);
    }
  }, [targetUserId]);

  return {
    messages,
    loading,
    sending,
    typing,
    isOnline,
    lastSeen,
    sendMessage,
    handleTyping,
    setMessages
  };
};
