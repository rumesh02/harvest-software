import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import ModernChatBox from './ModernChatBox';
import RecentChats from './RecentChats';
import ChatFilterBar from './ChatFilterBar';
import FilteredUserList from './FilteredUserList';
import ChatNotificationSystem from './ChatNotificationSystem';
import useRecentChats from '../hooks/useRecentChats';
import { getRoleColor } from '../utils/roleColors';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Badge,
  Snackbar,
  Alert,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Chat as ChatIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import io from 'socket.io-client';
import './ChatContainer.css';

const socket = io('http://localhost:5000');

const ChatContainer = ({ currentUserId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [refreshChats, setRefreshChats] = useState(0);
  const [openedFromNotification, setOpenedFromNotification] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0 = Recent Chats, 1 = Find Users
  const [usersLoading, setUsersLoading] = useState(false);

  // Initialize recent chats hook
  const { addNewChat, isAPIAvailable } = useRecentChats();
  
  // Get current user role for theming
  const currentUserRole = localStorage.getItem('userRole') || 'merchant';
  const roleColors = useMemo(() => getRoleColor(currentUserRole), [currentUserRole]);
  
  // Debug the hook initialization
  useEffect(() => {
    console.log('🔵 ChatContainer: useRecentChats hook initialized');
    console.log('🔵 addNewChat type:', typeof addNewChat);
    console.log('🔵 API available:', isAPIAvailable());
  }, [addNewChat, isAPIAvailable]);

  // Set up handler for message notification clicks
  useEffect(() => {
    window.handleMessageNotificationClick = (senderId) => {
      const user = allUsers.find(u => u.auth0Id === senderId);
      if (user) {
        setSelectedUser(user);
        setOpenedFromNotification(true); // This is from a notification click
        setActiveTab(0); // Switch to Recent Chats tab
        
        // Reset the flag after a delay
        setTimeout(() => {
          setOpenedFromNotification(false);
        }, 10000);
        
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

  // Listen for new messages
  useEffect(() => {
    if (!currentUserId) return;

    socket.on('receiveMessage', (message) => {
      if (message.receiverId === currentUserId) {
        // Show notification
        setNotificationMessage(`New message from ${message.senderName || 'Someone'}`);
        setShowNotification(true);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [currentUserId]);

  // Handle URL parameters for opening specific chats from notifications
  useEffect(() => {
    if (!currentUserId || !allUsers.length) return;

    const searchParams = new URLSearchParams(location.search);
    const chatWithUserId = searchParams.get('chatWith');
    
    if (chatWithUserId) {
      console.log('🔗 URL parameter detected: chatWith =', chatWithUserId);
      
      // Find the user in allUsers
      const targetUser = allUsers.find(u => u.auth0Id === chatWithUserId);
      
      if (targetUser) {
        console.log('✅ Found target user for chat:', targetUser.name);
        
        // Set selected user to open the chat
        setSelectedUser(targetUser);
        
        // Mark that this chat was opened from a notification
        setOpenedFromNotification(true);
        
        // Reset the flag after a delay to avoid it showing on subsequent chats
        setTimeout(() => {
          setOpenedFromNotification(false);
        }, 10000); // Hide banner after 10 seconds
        
        // Switch to Recent Chats tab
        setActiveTab(0);
        
        // Add to recent chats if not already there
        addNewChat({
          userId: targetUser.auth0Id,
          name: targetUser.name,
          picture: targetUser.picture,
          role: targetUser.role,
          email: targetUser.email,
          lastMessage: '',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0
        });
        
        // Mark message notifications from this user as read
        setTimeout(async () => {
          try {
            await axios.put(`http://localhost:5000/api/notifications/read-messages/${currentUserId}/${chatWithUserId}`);
            console.log('✅ Message notifications marked as read for user:', targetUser.name);
          } catch (error) {
            console.error('❌ Error marking message notifications as read:', error);
          }
        }, 1000);
        
        // Show notification that chat was opened from notification
        setNotificationMessage(`🔔 Opened chat with ${targetUser.name} from notification`);
        setShowNotification(true);
        
        // Clear the URL parameter to avoid re-triggering on navigation
        navigate(location.pathname, { replace: true });
        
        console.log('🎯 Chat opened with user:', targetUser.name);
      } else {
        console.warn('⚠️ User not found for chatWith parameter:', chatWithUserId);
        console.log('📋 Available users:', allUsers.map(u => ({ id: u.auth0Id, name: u.name })));
      }
    }
  }, [location.search, allUsers, currentUserId, addNewChat, navigate, location.pathname]);

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
        setOpenedFromNotification(false); // Reset notification flag for normal selection
      } else {
        console.error('❌ User not found in allUsers for chat.userId:', chat.userId);
        console.log('📋 Available users:', allUsers.map(u => ({ id: u.auth0Id, name: u.name })));
      }
    }, 100);
  };

  const handleUserSearchSelect = (user) => {
    console.log('🔵 User search select triggered:', user);
    console.log('🔵 addNewChat function available:', typeof addNewChat);
    
    setSelectedUser(user);
    setOpenedFromNotification(false); // Reset notification flag for normal selection
    
    // Add to recent chats using the hook
    try {
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
      console.log('✅ addNewChat called successfully');
    } catch (error) {
      console.error('🔴 Error calling addNewChat:', error);
    }
    
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
      setOpenedFromNotification(true); // This is from a notification click
      setActiveTab(0); // Switch to Recent Chats tab
      
      // Reset the flag after a delay
      setTimeout(() => {
        setOpenedFromNotification(false);
      }, 10000);
      
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
          roleColors={roleColors}
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
                backgroundColor: roleColors.primary,
              },
            }}
          >
            <Tab 
              icon={<ChatIcon fontSize="small" />} 
              label="Recent Chats" 
              iconPosition="start"
              sx={{ 
                color: activeTab === 0 ? roleColors.primary : '#6B7280',
                '&.Mui-selected': { color: roleColors.primary }
              }}
            />
            <Tab 
              icon={<PeopleIcon fontSize="small" />} 
              label="Find Users" 
              iconPosition="start"
              sx={{ 
                color: activeTab === 1 ? roleColors.primary : '#6B7280',
                '&.Mui-selected': { color: roleColors.primary }
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
              fromNotification={openedFromNotification}
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
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              width: '100%'
            }}>
              <Button
                variant="contained"
                startIcon={<PeopleIcon />}
                onClick={() => setActiveTab(1)}
                sx={{
                  backgroundColor: roleColors.primary,
                  '&:hover': {
                    backgroundColor: roleColors.dark,
                  },
                  borderRadius: '12px',
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Find Users
              </Button>
            </Box>
          </Box>
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
