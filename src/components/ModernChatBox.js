import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Import new components
import ChatHeader from './chat/ChatHeader';
import MessageList from './chat/MessageList';
import MessageInput from './chat/MessageInput';

// Import custom hooks
import { useChat } from '../hooks/useChat';
import { useFileUpload } from '../hooks/useFileUpload';

// Styled Components
const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '#f0f2f5',
  position: 'relative',
}));

const ModernChatBox = ({ targetUser, currentUserId, targetUserId, onClose, fromNotification = false }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [showNotificationBanner, setShowNotificationBanner] = useState(fromNotification);

  // Auto-hide notification banner after 8 seconds
  useEffect(() => {
    if (fromNotification) {
      const timer = setTimeout(() => {
        setShowNotificationBanner(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [fromNotification]);

  // Get the correct target user ID - prefer targetUserId prop, fallback to targetUser properties
  const actualTargetUserId = targetUserId || targetUser?.auth0Id || targetUser?.id;

  console.log('🔵 ModernChatBox - Props received:', {
    currentUserId,
    targetUserId,
    actualTargetUserId,
    targetUser: targetUser ? {
      name: targetUser.name,
      auth0Id: targetUser.auth0Id,
      id: targetUser.id,
      _id: targetUser._id,
      role: targetUser.role // Added role logging
    } : null
  });

  // Use custom hooks with the correct user ID
  const {
    messages,
    loading,
    sending,
    typing,
    isOnline,
    lastSeen,
    sendMessage,
    handleTyping,
    setMessages,
    clearChatHistory
  } = useChat(currentUserId, actualTargetUserId, targetUser);

  const {
    uploadProgress,
    isUploading,
    selectedFiles,
    previewFiles,
    fileInputRef,
    handleFileSelect,
    removeFile,
    sendMessageWithFiles,
    clearSelectedFiles,
    triggerFileSelect,
    formatFileSize
  } = useFileUpload(currentUserId, actualTargetUserId, targetUser);

  // Show snackbar message
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Handle message sent
  const handleMessageSent = (messageData) => {
    setMessages(prev => [...prev, {
      ...messageData,
      status: 'sent'
    }]);

    // Update RecentChats
    if (window.recentChatsMessageHandlers?.handleSentMessage) {
      window.recentChatsMessageHandlers.handleSentMessage({
        receiverId: actualTargetUserId,
        message: messageData.message,
        receiverName: targetUser?.name,
        receiverPicture: targetUser?.picture,
        receiverRole: targetUser?.role
      });
    }
  };

  // Handle send message (text)
  const handleSendMessage = async (messageText) => {
    try {
      if (selectedFiles.length > 0) {
        // Send with files
        await sendMessageWithFiles(messageText, handleMessageSent);
        showSnackbar('Message with files sent successfully!', 'success');
      } else {
        // Send text only
        await sendMessage(messageText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showSnackbar('Failed to send message. Please try again.', 'error');
    }
  };

  // Handle clear chat history
  const handleClearChat = async () => {
    try {
      const result = await clearChatHistory();
      if (result.success) {
        showSnackbar('Your chat history has been cleared successfully!', 'success');
      } else {
        showSnackbar(result.message || 'Failed to clear chat history', 'error');
      }
    } catch (error) {
      console.error('Error clearing chat history:', error);
      showSnackbar('Failed to clear chat history. Please try again.', 'error');
    }
  };

  if (!targetUser) {
    return (
      <ChatContainer>
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          height="100%"
        >
          <Typography variant="h6" color="textSecondary">
            Select a conversation to start messaging
          </Typography>
        </Box>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      {/* Chat Header */}
      <ChatHeader
        targetUser={targetUser}
        isOnline={isOnline}
        lastSeen={lastSeen}
        onClose={onClose}
        currentUserId={currentUserId}
        onClearChat={handleClearChat}
      />

      {/* Notification Banner - shown when chat is opened from notification */}
      {showNotificationBanner && (
        <Box
          sx={{
            backgroundColor: '#E3F2FD',
            borderLeft: '4px solid #2196F3',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.875rem',
            color: '#1565C0',
            animation: 'slideIn 0.3s ease-out',
            '@keyframes slideIn': {
              from: { opacity: 0, transform: 'translateY(-10px)' },
              to: { opacity: 1, transform: 'translateY(0)' }
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              🔔 Opened from notification
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={() => setShowNotificationBanner(false)}
            sx={{ 
              minWidth: 'auto', 
              color: '#1565C0',
              '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.1)' }
            }}
          >
            ×
          </Button>
        </Box>
      )}

      {/* Messages Area */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        loading={loading}
        typing={typing}
        targetUser={targetUser}
      />

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        disabled={sending || isUploading}
        selectedFiles={selectedFiles}
        previewFiles={previewFiles}
        uploadProgress={uploadProgress}
        isUploading={isUploading}
        fileInputRef={fileInputRef}
        onFileSelect={handleFileSelect}
        onRemoveFile={removeFile}
        onClearFiles={clearSelectedFiles}
        onTriggerFileSelect={triggerFileSelect}
        formatFileSize={formatFileSize}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ChatContainer>
  );
};

export default ModernChatBox;
