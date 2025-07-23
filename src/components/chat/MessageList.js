import React, { useEffect, useRef, useMemo } from 'react';
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
import { getRoleColor } from '../../utils/roleColors';

const MessagesContainer = styled(Box)(({ theme, rolecolors }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  background: '#ffffff',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="${encodeURIComponent(rolecolors?.primary || '#d1d5db')}" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: rolecolors?.primary || '#d1d5db',
    borderRadius: '10px',
    '&:hover': {
      background: rolecolors?.dark || '#6b7280',
    },
  },
}));

const MessageBubble = styled(Box)(({ theme, isown, rolecolors }) => ({
  maxWidth: '70%',
  padding: '10px 14px',
  borderRadius: isown ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
  background: isown 
    ? rolecolors?.primary || '#1976d2' 
    : '#ffffff',
  color: isown ? 'white' : '#1f2937',
  boxShadow: isown 
    ? `0 3px 12px ${rolecolors?.primary || '#10b981'}40` 
    : '0 2px 8px rgba(0,0,0,0.1)',
  position: 'relative',
  wordWrap: 'break-word',
  marginBottom: '3px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${isown ? rolecolors?.dark || '#059669' : '#e5e7eb'}`,
  backdropFilter: 'blur(10px)',
  '&:hover': {
    transform: 'scale(1.02) translateY(-1px)',
    boxShadow: isown 
      ? `0 6px 20px ${rolecolors?.primary || '#10b981'}50` 
      : '0 4px 16px rgba(0,0,0,0.15)',
  },
  '&::before': isown ? {
    content: '""',
    position: 'absolute',
    bottom: '-1px',
    right: '-1px',
    width: '12px',
    height: '12px',
    background: 'inherit',
    borderRadius: '0 0 12px 0',
    transform: 'rotate(45deg)',
    borderRight: `1px solid ${rolecolors?.dark || '#059669'}`,
    borderBottom: `1px solid ${rolecolors?.dark || '#059669'}`,
  } : {
    content: '""',
    position: 'absolute',
    bottom: '-1px',
    left: '-1px',
    width: '12px',
    height: '12px',
    background: '#ffffff',
    borderRadius: '0 0 0 12px',
    transform: 'rotate(45deg)',
    borderLeft: '1px solid #e5e7eb',
    borderBottom: '1px solid #e5e7eb',
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

const MessageTime = styled(Typography)(({ theme, isown, rolecolors }) => ({
  fontSize: '11px',
  color: isown ? 'rgba(255,255,255,0.8)' : '#667781',
  marginTop: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  textShadow: isown ? '0 1px 1px rgba(0,0,0,0.2)' : 'none',
}));

const DateSeparator = styled(Box)(({ theme, rolecolors }) => ({
  display: 'flex',
  alignItems: 'center',
  margin: '16px 0 8px 0',
  '&::before, &::after': {
    content: '""',
    flex: 1,
    height: '1px',
    background: rolecolors?.primary || '#d1d5db',
    opacity: 0.3,
  },
}));

const DateChip = styled(Chip)(({ theme, rolecolors }) => ({
  backgroundColor: 'rgba(255,255,255,0.95)',
  color: rolecolors?.dark || '#6b7280',
  fontSize: '12px',
  fontWeight: 600,
  height: '28px',
  margin: '0 12px',
  boxShadow: `0 2px 8px ${rolecolors?.primary || '#1976d2'}20`,
  border: `1px solid ${rolecolors?.light || '#e5e7eb'}`,
}));

const TypingIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '3px',
  '& span': {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    animation: 'typingAnimation 1.4s infinite',
    '&:nth-of-type(1)': {
      animationDelay: '0s',
    },
    '&:nth-of-type(2)': {
      animationDelay: '0.2s',
    },
    '&:nth-of-type(3)': {
      animationDelay: '0.4s',
    },
  },
  '@keyframes typingAnimation': {
    '0%, 60%, 100%': {
      transform: 'translateY(0)',
      opacity: 0.4,
    },
    '30%': {
      transform: 'translateY(-6px)',
      opacity: 1,
    },
  },
}));

// Message status component
const MessageStatus = ({ status, isOwn, roleColors }) => {
  if (!isOwn) return null;
  
  const iconColor = 'rgba(255,255,255,0.8)';
  const readColor = '#4ade80';
  
  switch (status) {
    case 'sending':
      return <ScheduleIcon sx={{ fontSize: 12, color: iconColor }} />;
    case 'sent':
      return <CheckIcon sx={{ fontSize: 12, color: iconColor }} />;
    case 'delivered':
      return <DoneAllIcon sx={{ fontSize: 12, color: iconColor }} />;
    case 'read':
      return <DoneAllIcon sx={{ fontSize: 12, color: readColor }} />;
    default:
      return <CheckIcon sx={{ fontSize: 12, color: iconColor }} />;
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

  // Get current user role for theming
  const currentUserRole = localStorage.getItem('userRole') || 'default';
  const roleColors = useMemo(() => ({
    ...getRoleColor(currentUserRole),
    role: currentUserRole
  }), [currentUserRole]);
  
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
      <MessagesContainer rolecolors={roleColors}>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="100%"
        >
          <Typography sx={{ color: roleColors.dark }}>Loading messages...</Typography>
        </Box>
      </MessagesContainer>
    );
  }

  if (messages.length === 0) {
    return (
      <MessagesContainer rolecolors={roleColors}>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="100%" 
          flexDirection="column"
          sx={{ gap: 2 }}
        >
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: roleColors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 32px ${roleColors.primary}30`,
          }}>
            <Typography variant="h3" sx={{ color: 'white' }}>💬</Typography>
          </Box>
          <Typography variant="h6" sx={{ color: roleColors.dark, fontWeight: 600 }}>
            No messages yet
          </Typography>
          <Typography variant="body2" sx={{ color: roleColors.secondary, textAlign: 'center' }}>
            Start a conversation with {targetUser?.name}
          </Typography>
        </Box>
      </MessagesContainer>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <MessagesContainer rolecolors={roleColors}>
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <Box key={date}>
          <DateSeparator rolecolors={roleColors}>
            <DateChip rolecolors={roleColors} label={formatDate(date)} size="small" />
          </DateSeparator>
          
          {msgs.map((message, index) => {
            const isOwn = message.senderId === currentUserId;
            return (
              <Fade in={true} timeout={300} key={message.id || index}>
                <MessageWrapper isown={isOwn}>
                  <MessageBubble isown={isOwn} rolecolors={roleColors}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: isOwn ? 'white' : '#1f2937',
                        lineHeight: 1.4,
                        wordBreak: 'break-word'
                      }}
                    >
                      {message.messageType === 'file' ? 
                        renderFileMessage(message) : 
                        message.message
                      }
                    </Typography>
                    <MessageTime isown={isOwn} rolecolors={roleColors}>
                      {formatTime(message.timestamp)}
                      <MessageStatus status={message.status} isOwn={isOwn} roleColors={roleColors} />
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
              <Box sx={{
                backgroundColor: roleColors.light,
                border: `1px solid ${roleColors.secondary}`,
                borderRadius: '18px 18px 18px 4px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                maxWidth: '70%',
                boxShadow: `0 2px 8px ${roleColors.primary}20`,
              }}>
                <Typography variant="caption" sx={{ color: roleColors.dark }}>
                  {targetUser?.name} is typing
                </Typography>
                <TypingIndicator>
                  <span style={{ backgroundColor: roleColors.primary }} />
                  <span style={{ backgroundColor: roleColors.primary }} />
                  <span style={{ backgroundColor: roleColors.primary }} />
                </TypingIndicator>
              </Box>
            </MessageWrapper>
          </Zoom>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </MessagesContainer>
    );
  };

export default MessageList;
