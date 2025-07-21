import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Fade,
  Zoom
} from '@mui/material';
import {
  Check as CheckIcon,
  DoneAll as DoneAllIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { groupMessagesByDate, formatDate, formatTime } from '../../utils/chatUtils';

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: '8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f3f4f6" fill-opacity="0.4"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#d1d5db',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#9ca3af',
  },
}));

const MessageBubble = styled(Box)(({ theme, isown, ishighlighted }) => ({
  maxWidth: '70%',
  padding: '8px 12px',
  borderRadius: isown ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
  backgroundColor: ishighlighted 
    ? (isown ? '#FFF9C4' : '#E8F5E8') // Yellow for own, green for others when highlighted
    : (isown ? '#dcf8c6' : '#ffffff'),
  boxShadow: ishighlighted 
    ? '0 0 0 2px #FFD700, 0 1px 2px rgba(0,0,0,0.1)' // Gold outline when highlighted
    : '0 1px 2px rgba(0,0,0,0.1)',
  position: 'relative',
  wordWrap: 'break-word',
  marginBottom: '2px',
  transition: 'all 0.2s ease',
  border: `1px solid ${isown ? '#c3e88d' : '#e5e7eb'}`,
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: ishighlighted 
      ? '0 0 0 2px #FFD700, 0 2px 8px rgba(0,0,0,0.15)' 
      : '0 2px 8px rgba(0,0,0,0.15)',
  },
}));

const MessageWrapper = styled(Box)(({ isown }) => ({
  display: 'flex',
  justifyContent: isown ? 'flex-end' : 'flex-start',
  marginBottom: '4px',
  animation: 'messageSlideIn 0.3s ease-out',
  '@keyframes messageSlideIn': {
    from: {
      opacity: 0,
      transform: `translateX(${isown ? '20px' : '-20px'})`,
    },
    to: {
      opacity: 1,
      transform: 'translateX(0)',
    },
  },
}));

const MessageTime = styled(Typography)(({ theme }) => ({
  fontSize: '11px',
  color: '#667781',
  marginTop: '2px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
}));

const DateSeparator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  margin: '16px 0 8px 0',
  '&::before, &::after': {
    content: '""',
    flex: 1,
    height: '1px',
    backgroundColor: '#d1d5db',
  },
}));

const DateChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(255,255,255,0.9)',
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: 600,
  height: '28px',
  margin: '0 12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
}));

const TypingIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  backgroundColor: 'rgba(255,255,255,0.9)',
  borderRadius: '12px',
  margin: '4px 0',
  maxWidth: '120px',
  '& .typing-dots': {
    display: 'flex',
    gap: '2px',
    '& span': {
      width: '4px',
      height: '4px',
      borderRadius: '50%',
      backgroundColor: '#9ca3af',
      animation: 'typingAnimation 1.4s infinite',
      '&:nth-of-type(2)': {
        animationDelay: '0.2s',
      },
      '&:nth-of-type(3)': {
        animationDelay: '0.4s',
      },
    },
  },
  '@keyframes typingAnimation': {
    '0%, 60%, 100%': {
      transform: 'translateY(0)',
      opacity: 0.4,
    },
    '30%': {
      transform: 'translateY(-8px)',
      opacity: 1,
    },
  },
}));

// Message status component
const MessageStatus = ({ status, isOwn }) => {
  if (!isOwn) return null;
  
  switch (status) {
    case 'sending':
      return <ScheduleIcon sx={{ fontSize: 12, color: '#9ca3af' }} />;
    case 'sent':
      return <CheckIcon sx={{ fontSize: 12, color: '#9ca3af' }} />;
    case 'delivered':
      return <DoneAllIcon sx={{ fontSize: 12, color: '#9ca3af' }} />;
    case 'read':
      return <DoneAllIcon sx={{ fontSize: 12, color: '#10b981' }} />;
    default:
      return <CheckIcon sx={{ fontSize: 12, color: '#9ca3af' }} />;
  }
};

const MessageList = ({ 
  messages = [], 
  currentUserId, 
  targetUser, 
  typing = false, 
  loading = false
}) => {
  const messagesEndRef = useRef(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  
  console.log('🔵 MessageList render:', { 
    messagesCount: messages.length,
    currentUserId,
    targetUser: targetUser?.name,
    typing,
    loading 
  });

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Handle message highlighting from notifications
  useEffect(() => {
    const shouldHighlight = sessionStorage.getItem('highlightLatestMessage');
    if (shouldHighlight === 'true' && messages.length > 0) {
      // Find the latest message from the target user
      const latestFromTargetUser = messages
        .filter(msg => msg.senderId === targetUser?.auth0Id || msg.senderId === targetUser?.id)
        .sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt))[0];
      
      if (latestFromTargetUser) {
        setHighlightedMessageId(latestFromTargetUser._id);
        console.log('🔆 Highlighting message:', latestFromTargetUser._id);
        
        // Clear the highlight after 3 seconds
        setTimeout(() => {
          setHighlightedMessageId(null);
        }, 3000);
      }
      
      // Clear the session storage flag
      sessionStorage.removeItem('highlightLatestMessage');
    }
  }, [messages, targetUser]);

  // Simple file message renderer
  const renderFileMessage = (message) => {
    if (message.fileUrl) {
      const isImage = message.fileType?.startsWith('image/');
      return (
        <Box>
          {isImage ? (
            <img
              src={message.fileUrl}
              alt={message.fileName || 'Shared file'}
              style={{
                maxWidth: '200px',
                maxHeight: '200px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.15)'
                }
              }}
              onClick={() => window.open(message.fileUrl, '_blank')}
            >
              📎 {message.fileName || 'File'}
            </Box>
          )}
          {message.message && message.message !== `📎 ${message.fileName}` && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {message.message}
            </Typography>
          )}
        </Box>
      );
    }
    return message.message;
  };

  if (loading) {
    return (
      <MessagesContainer>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="100%"
        >
          <Typography>Loading messages...</Typography>
        </Box>
      </MessagesContainer>
    );
  }

  if (messages.length === 0) {
    return (
      <MessagesContainer>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="100%" 
          flexDirection="column"
        >
          <Typography variant="h6" color="textSecondary">
            No messages yet
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Start a conversation with {targetUser?.name}
          </Typography>
        </Box>
      </MessagesContainer>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <MessagesContainer>
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <Box key={date}>
          <DateSeparator>
            <DateChip label={formatDate(date)} size="small" />
          </DateSeparator>
          
          {msgs.map((message, index) => {
            const isOwn = message.senderId === currentUserId;
            const isHighlighted = highlightedMessageId === message._id;
            return (
              <Fade in={true} timeout={300} key={message.id || index}>
                <MessageWrapper isown={isOwn}>
                  <MessageBubble isown={isOwn} ishighlighted={isHighlighted}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#1f2937',
                        lineHeight: 1.4,
                        wordBreak: 'break-word'
                      }}
                    >
                      {message.messageType === 'file' ? 
                        renderFileMessage(message) : 
                        message.message
                      }
                    </Typography>
                    <MessageTime>
                      {formatTime(message.timestamp)}
                      <MessageStatus status={message.status} isOwn={isOwn} />
                    </MessageTime>
                  </MessageBubble>
                </MessageWrapper>
              </Fade>
            );
          })}
        </Box>
      ))}        {/* Typing Indicator */}
        {typing && (
          <Zoom in={typing}>
            <MessageWrapper isown={false}>
              <TypingIndicator>
                <Typography variant="caption" sx={{ mr: 1, color: '#6b7280' }}>
                  {targetUser?.name} is typing
                </Typography>
                <div className="typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </TypingIndicator>
            </MessageWrapper>
          </Zoom>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </MessagesContainer>
    );
  };

export default MessageList;
