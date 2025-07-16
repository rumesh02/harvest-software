import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  Chat as ChatIcon,
  Person as PersonIcon,
  BusinessCenter as BusinessIcon,
  LocalShipping as TruckIcon
} from '@mui/icons-material';
import axios from 'axios';

const RecentChats = ({ userId, onChatSelect, refreshTrigger }) => {
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  // Get role icon component
  const getRoleIcon = (role) => {
    const iconProps = { sx: { fontSize: 14 } };
    switch (role?.toLowerCase()) {
      case 'farmer': return <PersonIcon {...iconProps} />;
      case 'merchant': return <BusinessIcon {...iconProps} />;
      case 'transporter': return <TruckIcon {...iconProps} />;
      default: return <PersonIcon {...iconProps} />;
    }
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'farmer': return '#059669';
      case 'merchant': return '#dc2626';
      case 'transporter': return '#2563eb';
      default: return '#6b7280';
    }
  };

  // Local storage key
  const STORAGE_KEY = `recentChats_${userId}`;

  // Load chats from localStorage
  const loadFromLocalStorage = useCallback(() => {
    if (!userId) return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  }, [userId, STORAGE_KEY]);

  // Save chats to localStorage
  const saveToLocalStorage = useCallback((chats) => {
    if (!userId || !chats) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [userId, STORAGE_KEY]);

  // Fetch recent chats from API
  const fetchRecentChats = useCallback(async () => {
    if (!userId || !mountedRef.current) return;

    try {
      setError(null);
      console.log('🔍 Fetching recent chats for userId:', userId);
      const response = await axios.get(`http://localhost:5000/api/messages/recent/${userId}`);
      
      if (!mountedRef.current) return;

      let apiChats = response.data || [];
      console.log('📋 API Response - Recent chats:', apiChats);
      
      // Validate that each chat has correct userId
      apiChats.forEach((chat, index) => {
        if (chat.userId === userId) {
          console.warn(`⚠️ WARNING: Chat ${index} has same userId as current user. This might cause message mixing!`, {
            chatUserId: chat.userId,
            currentUserId: userId,
            chatName: chat.name
          });
        }
      });
      
      // Merge with localStorage data
      const localChats = loadFromLocalStorage();
      const mergedChats = mergeChats(apiChats, localChats);
      
      console.log('🔄 Merged chats:', mergedChats);
      setRecentChats(mergedChats);
      saveToLocalStorage(mergedChats);
      
    } catch (error) {
      console.error('❌ Error fetching recent chats:', error);
      if (!mountedRef.current) return;
      
      setError(error.message);
      // Fall back to localStorage data on API error
      const fallbackChats = loadFromLocalStorage();
      setRecentChats(fallbackChats);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [userId, loadFromLocalStorage, saveToLocalStorage]);

  // Merge API and localStorage chats
  const mergeChats = useCallback((apiChats, localChats) => {
    const chatMap = new Map();
    
    // Add local chats first (fallback data)
    localChats.forEach(chat => {
      if (chat.userId) {
        chatMap.set(chat.userId, { ...chat, source: 'local' });
      }
    });
    
    // Override with API chats (more recent data)
    apiChats.forEach(chat => {
      if (chat.userId) {
        chatMap.set(chat.userId, { ...chat, source: 'api' });
      }
    });
    
    // Convert back to array and sort by lastMessageTime
    return Array.from(chatMap.values())
      .sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0));
  }, []);

  // Add new chat to the list
  const addNewChat = useCallback((newChat) => {
    if (!newChat || !newChat.userId || !mountedRef.current) return;

    setRecentChats(prevChats => {
      const existingIndex = prevChats.findIndex(chat => chat.userId === newChat.userId);
      let updatedChats;

      if (existingIndex >= 0) {
        // Update existing chat
        updatedChats = [...prevChats];
        updatedChats[existingIndex] = {
          ...updatedChats[existingIndex],
          ...newChat,
          lastMessageTime: newChat.lastMessageTime || new Date().toISOString()
        };
      } else {
        // Add new chat at the beginning
        updatedChats = [
          {
            ...newChat,
            lastMessageTime: newChat.lastMessageTime || new Date().toISOString(),
            unreadCount: 0
          },
          ...prevChats
        ];
      }

      // Sort by lastMessageTime
      updatedChats.sort((a, b) => 
        new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0)
      );

      // Save to localStorage
      saveToLocalStorage(updatedChats);
      return updatedChats;
    });
  }, [saveToLocalStorage]);

  // Update chat with new message
  const updateChatMessage = useCallback((userId, message, incrementUnread = false) => {
    if (!userId || !message || !mountedRef.current) return;

    setRecentChats(prevChats => {
      const updatedChats = prevChats.map(chat => {
        if (chat.userId === userId) {
          return {
            ...chat,
            lastMessage: message,
            lastMessageTime: new Date().toISOString(),
            unreadCount: incrementUnread ? (chat.unreadCount || 0) + 1 : chat.unreadCount
          };
        }
        return chat;
      });

      // Sort by lastMessageTime
      updatedChats.sort((a, b) => 
        new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0)
      );

      saveToLocalStorage(updatedChats);
      return updatedChats;
    });
  }, [saveToLocalStorage]);

  // Clear unread count for a chat
  const clearUnreadCount = useCallback((chatUserId) => {
    if (!chatUserId || !mountedRef.current) return;

    setRecentChats(prevChats => {
      const updatedChats = prevChats.map(chat => 
        chat.userId === chatUserId ? { ...chat, unreadCount: 0 } : chat
      );
      saveToLocalStorage(updatedChats);
      return updatedChats;
    });
  }, [saveToLocalStorage]);

  // Initialize component
  useEffect(() => {
    mountedRef.current = true;
    
    if (!userId) {
      setLoading(false);
      return;
    }

    // Load initial data from localStorage
    const initialChats = loadFromLocalStorage();
    if (initialChats.length > 0) {
      setRecentChats(initialChats);
      setLoading(false);
    }

    // Fetch from API
    fetchRecentChats();

    return () => {
      mountedRef.current = false;
    };
  }, [userId, fetchRecentChats, loadFromLocalStorage]);

  // Set up periodic refresh
  useEffect(() => {
    if (!userId) return;

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        fetchRecentChats();
      }
    }, 30000); // Refresh every 30 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userId, fetchRecentChats]);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && userId) {
      fetchRecentChats();
    }
  }, [refreshTrigger, userId, fetchRecentChats]);

  // Expose methods to parent component
  useEffect(() => {
    if (window.recentChatsAPI) {
      window.recentChatsAPI = {
        addNewChat,
        updateChatMessage,
        clearUnreadCount
      };
    } else {
      window.recentChatsAPI = {
        addNewChat,
        updateChatMessage,
        clearUnreadCount
      };
    }
  }, [addNewChat, updateChatMessage, clearUnreadCount]);

  const handleChatClick = (chat) => {
    console.log('🖱️ Chat clicked:', {
      chatUserId: chat.userId,
      chatName: chat.name,
      currentUserId: userId,
      fullChatObject: chat
    });
    
    if (onChatSelect && chat) {
      // Validate that we're not selecting our own chat
      if (chat.userId === userId) {
        console.error('❌ ERROR: Trying to open chat with self! This will cause message mixing.');
        return;
      }
      
      // Clear unread count when chat is selected
      clearUnreadCount(chat.userId);
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

  if (loading && recentChats.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={20} sx={{ color: '#D97706' }} />
      </Box>
    );
  }

  if (error && recentChats.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <ChatIcon sx={{ fontSize: 48, color: '#e5e7eb', mb: 2 }} />
        <Typography variant="body2" color="#EF4444" sx={{ mb: 1 }}>
          Failed to load recent chats
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Using cached data. Check your connection.
        </Typography>
      </Box>
    );
  }

  if (recentChats.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <ChatIcon sx={{ fontSize: 48, color: '#e5e7eb', mb: 2 }} />
        <Typography variant="body2" color="#6B7280" sx={{ mb: 1 }}>
          No recent conversations
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Start a new conversation to see it here
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {error && recentChats.length > 0 && (
        <Box sx={{ 
          p: 1, 
          backgroundColor: '#FEF3CD', 
          borderBottom: '1px solid #F59E0B',
          textAlign: 'center'
        }}>
          <Typography variant="caption" color="#92400E">
            Using cached data - Connection issue
          </Typography>
        </Box>
      )}
      
      <List sx={{ p: 0 }}>
        {recentChats.map((chat, index) => (
          <React.Fragment key={chat.userId || index}>
            {index > 0 && <Divider />}
            <ListItem 
              sx={{ 
                px: 2, 
                py: 1.5, 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: chat.unreadCount > 0 ? 'rgba(217, 119, 6, 0.05)' : 'transparent',
                borderLeft: chat.unreadCount > 0 ? '3px solid #D97706' : '3px solid transparent',
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
                  invisible={!chat.unreadCount || chat.unreadCount === 0}
                  max={99}
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#D97706',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }
                  }}
                >
                  <Avatar 
                    src={chat.picture || "/placeholder.svg"}
                    alt={chat.name}
                    sx={{ 
                      width: 44, 
                      height: 44,
                      bgcolor: chat.unreadCount > 0 ? '#D97706' : getRoleColor(chat.role),
                      border: `2px solid ${getRoleColor(chat.role)}`,
                      fontSize: '16px',
                      fontWeight: 600
                    }}
                  >
                    {chat.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: chat.unreadCount > 0 ? 700 : 500,
                          color: chat.unreadCount > 0 ? '#1F2937' : '#374151',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {chat.name}
                      </Typography>
                      {chat.role && (
                        <Chip
                          icon={getRoleIcon(chat.role)}
                          label={chat.role}
                          size="small"
                          sx={{
                            height: '18px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            backgroundColor: `${getRoleColor(chat.role)}15`,
                            color: getRoleColor(chat.role),
                            textTransform: 'capitalize',
                            '& .MuiChip-icon': {
                              color: getRoleColor(chat.role),
                              fontSize: '12px',
                            },
                          }}
                        />
                      )}
                    </Box>
                    <Typography 
                      variant="caption" 
                      color="#6B7280"
                      sx={{ 
                        fontSize: '0.7rem',
                        fontWeight: chat.unreadCount > 0 ? 600 : 400,
                        whiteSpace: 'nowrap',
                        ml: 1
                      }}
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
                      fontWeight: chat.unreadCount > 0 ? 600 : 400,
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.75rem',
                      lineHeight: 1.2
                    }}
                  >
                    {chat.lastMessage ? truncateMessage(chat.lastMessage, 35) : 'Start a conversation...'}
                  </Typography>
                }
                sx={{ 
                  margin: 0,
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
      
      {loading && recentChats.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
          <CircularProgress size={16} sx={{ color: '#D97706' }} />
        </Box>
      )}
    </Box>
  );
};

export default RecentChats; 