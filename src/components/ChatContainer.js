import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModernChatBox from './ModernChatBox';
import RecentChats from './RecentChats';
import ChatFilterBar from './ChatFilterBar';
import FilteredUserList from './FilteredUserList';
import ChatNotificationSystem from './ChatNotificationSystem';
import useRecentChats from '../hooks/useRecentChats';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider,
  Badge,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Button,
  Fab,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  Add as AddIcon,
  Search as SearchIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import io from 'socket.io-client';
import './ChatContainer.css';
import { styled } from '@mui/material/styles';

const socket = io('http://localhost:5000');

// Custom styled badge for WhatsApp-like notification
const BlueBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#3EC6FF', // WhatsApp blue
    color: '#fff',
    minWidth: 22,
    height: 22,
    fontWeight: 700,
    fontSize: '0.95rem',
    top: 2,
    right: 2,
    border: `2px solid ${theme.palette.background.paper}`,
    boxShadow: '0 0 0 2px #222',
    zIndex: 1,
  },
}));

const ChatContainer = ({ currentUserId }) => {
  const [chatUsers, setChatUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [refreshChats, setRefreshChats] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0 = Recent Chats, 1 = Find Users
  const [usersLoading, setUsersLoading] = useState(false);

  // Initialize recent chats hook
  const { addNewChat, updateChatMessage, clearUnreadCount } = useRecentChats();

  // Set up handler for message notification clicks
  useEffect(() => {
    window.handleMessageNotificationClick = (senderId) => {
      const user = allUsers.find(u => u.auth0Id === senderId);
      if (user) {
        setSelectedUser(user);
        setActiveTab(0); // Switch to Recent Chats tab
        
        // Add to recent chats
        addNewChat({
          userId: user.auth0Id,
          name: user.name,
          picture: user.picture,
          role: user.role,
          email: user.email,
          lastMessage: '',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0
        });
      }
    };

    return () => {
      if (window.handleMessageNotificationClick) {
        delete window.handleMessageNotificationClick;
      }
    };
  }, [allUsers, addNewChat]);

  // Fetch past chat users
  useEffect(() => {
    if (!currentUserId) return;

    axios.get(`http://localhost:5000/api/messages/contacts/${currentUserId}`)
      .then(res => setChatUsers(res.data))
      .catch(err => console.error('Failed to load chat contacts:', err));
  }, [currentUserId]);

  // Fetch all users for dropdown
  useEffect(() => {
    setUsersLoading(true);
    axios.get('http://localhost:5000/api/users')
      .then(res => {
        setAllUsers(res.data);
        setUsersLoading(false);
      })
      .catch(err => {
        console.error('Failed to load users:', err);
        setUsersLoading(false);
      });
  }, []);

  // Fetch initial unread count
  useEffect(() => {
    if (!currentUserId) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/messages/unread/${currentUserId}`);
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
  }, [currentUserId]);

  // Listen for new messages
  useEffect(() => {
    if (!currentUserId) return;

    socket.on('receiveMessage', (message) => {
      if (message.receiverId === currentUserId) {
        // Increment unread count
        setUnreadCount(prev => prev + 1);
        
        // Show notification
        setNotificationMessage(`New message from ${message.senderName || 'Someone'}`);
        setShowNotification(true);
        
        // Refresh chat users list
        axios.get(`http://localhost:5000/api/messages/contacts/${currentUserId}`)
          .then(res => setChatUsers(res.data))
          .catch(err => console.error('Failed to refresh chat contacts:', err));
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [currentUserId]);

  const startNewChat = (e) => {
    const selectedId = e.target.value;
    const user = allUsers.find((u) => u.auth0Id === selectedId);
    if (user) setSelectedUser(user);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleChatSelect = (chat) => {
    console.log('📱 ChatContainer - handleChatSelect called:', {
      chatUserId: chat.userId,
      chatName: chat.name,
      currentUserId: currentUserId,
      allUsersCount: allUsers.length
    });
    
    // Validate that we're not selecting ourselves
    if (chat.userId === currentUserId) {
      console.error('❌ ERROR: Cannot select chat with self! chat.userId === currentUserId:', chat.userId);
      return;
    }
    
    // Clear previous selection first to prevent state mixing
    console.log('🔄 Clearing previous selected user before setting new one');
    setSelectedUser(null);
    
    // Small delay to ensure state is cleared
    setTimeout(() => {
      const user = allUsers.find((u) => u.auth0Id === chat.userId);
      console.log('👤 Found user in allUsers:', user);
      
      if (user) {
        // Double-check user is not the current user
        if (user.auth0Id === currentUserId) {
          console.error('❌ ERROR: Found user is the same as current user! Aborting selection.');
          return;
        }
        
        console.log('✅ Setting selected user:', {
          selectedUserAuth0Id: user.auth0Id,
          selectedUserName: user.name,
          currentUserId: currentUserId
        });
        setSelectedUser(user);
      } else {
        console.error('❌ User not found in allUsers for chat.userId:', chat.userId);
        console.log('📋 Available users:', allUsers.map(u => ({ id: u.auth0Id, name: u.name })));
      }
    }, 100);
  };

  const handleUserSearchSelect = (user) => {
    setSelectedUser(user);
    
    // Add to recent chats using the hook
    addNewChat({
      userId: user.auth0Id,
      name: user.name,
      picture: user.picture,
      role: user.role,
      email: user.email,
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0
    });
    
    // Clear search filters to hide the dropdown
    setSearchTerm('');
    setSelectedRole('');
    
    // Trigger refresh of RecentChats component
    setRefreshChats(prev => prev + 1);
    
    // Switch back to Recent Chats tab
    setActiveTab(0);
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    if (term || selectedRole) {
      setActiveTab(1); // Switch to Find Users tab when searching
    }
  };

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
    if (role || searchTerm) {
      setActiveTab(1); // Switch to Find Users tab when filtering
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRole('');
    setActiveTab(0); // Switch back to Recent Chats
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      // Clear filters when switching to Recent Chats
      setSearchTerm('');
      setSelectedRole('');
    }
  };

  const handleNotificationClick = (senderId) => {
    const user = allUsers.find(u => u.auth0Id === senderId);
    if (user) {
      setSelectedUser(user);
      setActiveTab(0); // Switch to Recent Chats tab
      
      // Add to recent chats using the hook
      addNewChat({
        userId: user.auth0Id,
        name: user.name,
        picture: user.picture,
        role: user.role,
        email: user.email,
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0
      });
      
      setRefreshChats(prev => prev + 1);
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      background: '#f9f9f9',
      p: 2
    }}>
      {/* Left Sidebar - Recent Chats & User Search */}
      <Paper 
        elevation={0}
        sx={{ 
          width: 360, 
          mr: 2,
          background: 'rgba(255,255,255,0.95)',
          border: "1px solid #E5E7EB",
          borderRadius: 3,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Filter Bar - Always Visible */}
        <ChatFilterBar
          onSearchChange={handleSearchChange}
          onRoleFilter={handleRoleFilter}
          searchTerm={searchTerm}
          selectedRole={selectedRole}
          onClearFilters={handleClearFilters}
        />

        {/* Tab Navigation */}
        <Box sx={{ borderBottom: '1px solid #E5E7EB' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              minHeight: '48px',
              '& .MuiTab-root': {
                minHeight: '48px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#D97706',
              },
            }}
          >
            <Tab 
              icon={<ChatIcon fontSize="small" />} 
              label="Recent Chats" 
              iconPosition="start"
              sx={{ 
                color: activeTab === 0 ? '#D97706' : '#6B7280',
                '&.Mui-selected': { color: '#D97706' }
              }}
            />
            <Tab 
              icon={<PeopleIcon fontSize="small" />} 
              label="Find Users" 
              iconPosition="start"
              sx={{ 
                color: activeTab === 1 ? '#D97706' : '#6B7280',
                '&.Mui-selected': { color: '#D97706' }
              }}
            />
          </Tabs>
        </Box>

        {/* Content Area */}
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 0 ? (
            <RecentChats 
              userId={currentUserId} 
              onChatSelect={handleChatSelect}
              refreshTrigger={refreshChats}
            />
          ) : (
            <FilteredUserList
              users={allUsers}
              searchTerm={searchTerm}
              selectedRole={selectedRole}
              onUserSelect={handleUserSearchSelect}
              currentUserId={currentUserId}
              loading={usersLoading}
            />
          )}
        </Box>
      </Paper>

      {/* Right Side - Chat Area */}
      <Paper 
        elevation={0}
        sx={{ 
          flex: 1,
          background: 'rgba(255,255,255,0.9)',
          border: "1px solid #E5E7EB",
          borderRadius: 3,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {selectedUser ? (
          <>
            {console.log('🔵 ChatContainer - Rendering ModernChatBox with:', { 
              currentUserId, 
              targetUserId: selectedUser.auth0Id, 
              selectedUser: { _id: selectedUser._id, name: selectedUser.name, auth0Id: selectedUser.auth0Id }
            })}
            <ModernChatBox 
              key={`${currentUserId}-${selectedUser.auth0Id}`}
              currentUserId={currentUserId} 
              targetUserId={selectedUser.auth0Id} 
              targetUser={selectedUser} 
            />
          </>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            p: 4
          }}>
            <ChatIcon sx={{ fontSize: 80, color: '#6B7280', mb: 2 }} />
            <Typography variant="h5" color="#6B7280" gutterBottom sx={{ fontWeight: 600 }}>
              Select a Conversation
            </Typography>
            <Typography variant="body1" color="#6B7280" sx={{ textAlign: 'center', maxWidth: 400, mb: 3 }}>
              Choose a chat from the sidebar or use the search filters to find and start a new conversation
            </Typography>
            <Button
              variant="contained"
              startIcon={<PeopleIcon />}
              onClick={() => setActiveTab(1)}
              sx={{
                backgroundColor: '#D97706',
                '&:hover': {
                  backgroundColor: '#B45309',
                },
                borderRadius: '12px',
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Find Users to Chat
            </Button>
          </Box>
        )}

        {/* Quick Access Floating Button */}
        {selectedUser && activeTab === 0 && (
          <Fab
            color="primary"
            aria-label="find users"
            onClick={() => setActiveTab(1)}
            sx={{
              position: 'absolute',
              bottom: 24,
              right: 24,
              backgroundColor: '#D97706',
              '&:hover': {
                backgroundColor: '#B45309',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
              zIndex: 1,
            }}
          >
            <PeopleIcon />
          </Fab>
        )}
      </Paper>

      {/* Notification Snackbar */}
      <Snackbar
        open={showNotification}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity="info" 
          sx={{ width: '100%' }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>

      {/* Chat Notification System */}
      <ChatNotificationSystem
        currentUserId={currentUserId}
        socket={socket}
        onNotificationClick={handleNotificationClick}
        selectedUserId={selectedUser?.auth0Id}
      />
    </Box>
  );
};

export default ChatContainer;
