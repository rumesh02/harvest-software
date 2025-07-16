import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Paper,
  Chip,
  InputAdornment,
  Tooltip,
  Menu,
  MenuItem,
  Fade,
  Zoom,
  CircularProgress,
  Badge
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachIcon,
  EmojiEmotions as EmojiIcon,
  MoreVert as MoreIcon,
  Circle as OnlineIcon,
  Check as CheckIcon,
  DoneAll as DoneAllIcon,
  AccessTime as PendingIcon,
  Phone as PhoneIcon,
  VideoCall as VideoIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

// Styled Components
const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '#f0f2f5',
  position: 'relative',
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  zIndex: 10,
}));

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

const MessageBubble = styled(Box)(({ theme, isown, status }) => ({
  maxWidth: '70%',
  padding: '8px 12px',
  borderRadius: isown ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
  backgroundColor: isown ? '#dcf8c6' : '#ffffff',
  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  position: 'relative',
  wordWrap: 'break-word',
  marginBottom: '2px',
  transition: 'all 0.2s ease',
  border: `1px solid ${isown ? '#c3e88d' : '#e5e7eb'}`,
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
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

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-end',
  padding: '12px 16px',
  backgroundColor: '#ffffff',
  borderTop: '1px solid #e5e7eb',
  gap: '8px',
}));

const MessageTextField = styled(TextField)(({ theme }) => ({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
    backgroundColor: '#f8f9fa',
    minHeight: '40px',
    paddingRight: '8px',
    '& fieldset': {
      borderColor: '#e5e7eb',
    },
    '&:hover fieldset': {
      borderColor: '#d1d5db',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#10b981',
      borderWidth: '1px',
    },
  },
  '& .MuiInputBase-input': {
    padding: '10px 14px',
    fontSize: '14px',
    lineHeight: '1.4',
  },
}));

const SendButton = styled(IconButton)(({ theme, hastext }) => ({
  backgroundColor: hastext ? '#10b981' : '#e5e7eb',
  color: hastext ? 'white' : '#9ca3af',
  width: '40px',
  height: '40px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: hastext ? '#059669' : '#d1d5db',
    transform: hastext ? 'scale(1.1)' : 'none',
  },
  '&:disabled': {
    backgroundColor: '#e5e7eb',
    color: '#9ca3af',
  },
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

// Message status icons
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

// Main ChatBox Component
const ModernChatBox = ({ currentUserId, targetUserId, targetUser }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load chat history
  useEffect(() => {
    if (!currentUserId || !targetUserId) return;
    
    setLoading(true);
    axios.get(`http://localhost:5000/api/messages/${currentUserId}/${targetUserId}`)
      .then(res => {
        setMessages(res.data.map(msg => ({
          ...msg,
          status: msg.senderId === currentUserId ? 'read' : 'received'
        })));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching messages:', err);
        setLoading(false);
      });
    
    // Mark message notifications as read when opening chat
    markMessageNotificationsAsRead();
  }, [currentUserId, targetUserId]);

  // Mark message notifications from this user as read
  const markMessageNotificationsAsRead = async () => {
    if (!currentUserId || !targetUserId) return;
    
    try {
      // Call API to mark message notifications as read
      await axios.put(`http://localhost:5000/api/notifications/read-messages/${currentUserId}/${targetUserId}`);
    } catch (error) {
      console.error('Error marking message notifications as read:', error);
    }
  };

  // Clear unread count when chat is opened
  useEffect(() => {
    if (!targetUserId) return;
    
    // Clear unread count in RecentChats
    if (window.recentChatsMessageHandlers && window.recentChatsMessageHandlers.clearUnreadCount) {
      window.recentChatsMessageHandlers.clearUnreadCount(targetUserId);
    }
  }, [targetUserId]);

  // Socket setup
  useEffect(() => {
    if (!currentUserId || !targetUserId) return;

    socket.emit('joinRoom', { senderId: currentUserId, receiverId: targetUserId });
    socket.emit('join', currentUserId);

    socket.on('receiveMessage', (message) => {
      if (
        (message.senderId === currentUserId && message.receiverId === targetUserId) ||
        (message.senderId === targetUserId && message.receiverId === currentUserId)
      ) {
        setMessages(prev => [...prev, {
          ...message,
          status: message.senderId === currentUserId ? 'sent' : 'received'
        }]);
        
        // Mark message as read if we're the receiver
        if (message.receiverId === currentUserId) {
          axios.put(`http://localhost:5000/api/messages/read/${currentUserId}/${message.senderId}`)
            .catch(err => console.error('Error marking message as read:', err));
          
          // Update RecentChats with received message
          if (window.recentChatsMessageHandlers && window.recentChatsMessageHandlers.handleNewMessage) {
            window.recentChatsMessageHandlers.handleNewMessage({
              senderId: message.senderId,
              receiverId: message.receiverId,
              message: message.message,
              senderName: message.senderName,
              senderPicture: message.senderPicture,
              senderRole: message.senderRole
            });
          }
        }
      }
    });

    socket.on('userTyping', ({ userId, typing: isTyping }) => {
      if (userId === targetUserId) {
        setTyping(isTyping);
      }
    });

    socket.on('userOnline', ({ userId, online }) => {
      if (userId === targetUserId) {
        setIsOnline(online);
        if (!online) {
          setLastSeen(new Date());
        }
      }
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('userTyping');
      socket.off('userOnline');
    };
  }, [currentUserId, targetUserId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (currentUserId && targetUserId) {
      axios.put(`http://localhost:5000/api/messages/read/${currentUserId}/${targetUserId}`)
        .catch(err => console.error('Error marking messages as read:', err));
    }
  }, [currentUserId, targetUserId]);

  // Handle typing indicators
  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // Emit typing status
    socket.emit('typing', {
      senderId: currentUserId,
      receiverId: targetUserId,
      typing: true
    });

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
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    setSending(true);
    const tempId = Date.now();
    
    const messageData = {
      id: tempId,
      senderId: currentUserId,
      receiverId: targetUserId,
      message: input.trim(),
      timestamp: new Date(),
      senderName: targetUser?.name || 'Unknown User',
      status: 'sending'
    };

    // Add message immediately with sending status
    setMessages(prev => [...prev, messageData]);
    const messageText = input.trim();
    setInput('');

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
      if (window.recentChatsMessageHandlers && window.recentChatsMessageHandlers.handleSentMessage) {
        window.recentChatsMessageHandlers.handleSentMessage({
          receiverId: targetUserId,
          message: messageText,
          receiverName: targetUser?.name,
          receiverPicture: targetUser?.picture,
          receiverRole: targetUser?.role
        });
      }
      
      setSending(false);
    } catch (error) {
      console.error('Error sending message:', error);
      // Update status to failed
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: 'failed' } : msg
      ));
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = new Date(msg.timestamp).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (date.toDateString() === today) return 'Today';
    if (date.toDateString() === yesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const groupedMessages = groupMessagesByDate(messages);

  if (loading) {
    return (
      <ChatContainer>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%' 
        }}>
          <CircularProgress sx={{ color: '#10b981' }} />
        </Box>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      {/* Chat Header */}
      <ChatHeader>
        <Avatar
          src={targetUser?.picture}
          alt={targetUser?.name}
          sx={{ 
            width: 40, 
            height: 40, 
            mr: 2,
            border: '2px solid #10b981'
          }}
        >
          {targetUser?.name?.charAt(0).toUpperCase()}
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1f2937' }}>
            {targetUser?.name}
          </Typography>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            {isOnline ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Badge
                  variant="dot"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#10b981',
                      width: 8,
                      height: 8,
                    },
                  }}
                />
                Online
              </Box>
            ) : (
              `Last seen ${lastSeen ? formatTime(lastSeen) : 'recently'}`
            )}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Voice call">
            <IconButton sx={{ color: '#6b7280' }}>
              <PhoneIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Video call">
            <IconButton sx={{ color: '#6b7280' }}>
              <VideoIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="More options">
            <IconButton 
              sx={{ color: '#6b7280' }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <MoreIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => setAnchorEl(null)}>
            <InfoIcon sx={{ mr: 1 }} />
            Chat Info
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>
            Clear Chat
          </MenuItem>
        </Menu>
      </ChatHeader>

      {/* Messages Area */}
      <MessagesContainer>
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <Box key={date}>
            <DateSeparator>
              <DateChip label={formatDate(date)} size="small" />
            </DateSeparator>
            
            {msgs.map((message, index) => {
              const isOwn = message.senderId === currentUserId;
              return (
                <Fade in={true} timeout={300} key={message.id || index}>
                  <MessageWrapper isown={isOwn}>
                    <MessageBubble 
                      isown={isOwn}
                      status={message.status}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#1f2937',
                          lineHeight: 1.4,
                          wordBreak: 'break-word'
                        }}
                      >
                        {message.message}
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
        ))}

        {/* Typing Indicator */}
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
        
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {/* Input Area */}
      <InputContainer>
        <IconButton sx={{ color: '#6b7280' }}>
          <AttachIcon />
        </IconButton>
        
        <MessageTextField
          ref={inputRef}
          multiline
          maxRows={4}
          placeholder="Type a message..."
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          variant="outlined"
          size="small"
        />
        
        <IconButton sx={{ color: '#6b7280' }}>
          <EmojiIcon />
        </IconButton>
        
        <SendButton 
          hastext={input.trim() ? 1 : 0}
          onClick={handleSend}
          disabled={!input.trim() || sending}
        >
          <SendIcon />
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default ModernChatBox;
