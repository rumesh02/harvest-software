import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Badge, 
  Divider,
  CircularProgress
} from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import axios from 'axios';

const RecentChats = ({ userId, onChatSelect }) => {
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchRecentChats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/messages/recent/${userId}`);
        setRecentChats(response.data);
      } catch (error) {
        console.error('Error fetching recent chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentChats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchRecentChats, 30000);
    
    return () => clearInterval(interval);
  }, [userId]);

  const handleChatClick = (chat) => {
    if (onChatSelect) {
      onChatSelect(chat);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateMessage = (message, maxLength = 30) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (recentChats.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <ChatIcon sx={{ fontSize: 40, color: '#6B7280', mb: 1 }} />
        <Typography variant="body2" color="#6B7280">
          No recent chats
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <List sx={{ p: 0 }}>
        {recentChats.map((chat, index) => (
          <React.Fragment key={chat.userId}>
            {index > 0 && <Divider />}
            <ListItem 
              sx={{ 
                px: 2, 
                py: 1.5, 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { 
                  bgcolor: '#FFF8EC',
                  transform: 'translateX(4px)'
                }
              }}
              onClick={() => handleChatClick(chat)}
            >
              <ListItemAvatar>
                <Badge
                  badgeContent={chat.unreadCount}
                  color="error"
                  invisible={chat.unreadCount === 0}
                  max={99}
                >
                  <Avatar 
                    src={chat.picture || "/placeholder.svg"}
                    alt={chat.name}
                    sx={{ 
                      width: 40, 
                      height: 40,
                      bgcolor: chat.unreadCount > 0 ? '#D97706' : '#6B7280'
                    }}
                  >
                    {chat.name.charAt(0).toUpperCase()}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: chat.unreadCount > 0 ? 600 : 400,
                        color: chat.unreadCount > 0 ? '#065F46' : '#374151'
                      }}
                    >
                      {chat.name}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="#6B7280"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      {formatTime(chat.lastMessageTime)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: chat.unreadCount > 0 ? '#D97706' : '#6B7280',
                      fontWeight: chat.unreadCount > 0 ? 500 : 400,
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {truncateMessage(chat.lastMessage)}
                  </Typography>
                }
                sx={{ 
                  '& .MuiListItemText-secondary': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }
                }}
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default RecentChats; 