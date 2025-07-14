import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChatBox from './ChatBox';
import RecentChats from './RecentChats';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider,
  Badge,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Chat as ChatIcon
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

  // Fetch past chat users
  useEffect(() => {
    if (!currentUserId) return;

    axios.get(`http://localhost:5000/api/messages/contacts/${currentUserId}`)
      .then(res => setChatUsers(res.data))
      .catch(err => console.error('Failed to load chat contacts:', err));
  }, [currentUserId]);

  // Fetch all users for dropdown
  useEffect(() => {
    axios.get('http://localhost:5000/api/users')
      .then(res => setAllUsers(res.data))
      .catch(err => console.error('Failed to load users:', err));
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
    const user = allUsers.find((u) => u.auth0Id === chat.userId);
    if (user) {
      setSelectedUser(user);
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
      {/* Left Sidebar - Recent Chats */}
      <Paper 
        elevation={0}
        sx={{ 
          width: 320, 
          mr: 2,
          background: 'rgba(255,255,255,0.9)',
          border: "1px solid #E5E7EB",
          borderRadius: 3,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header with Notifications */}
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <ChatIcon sx={{ color: '#D97706', fontSize: 32 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#374151', ml: 1 }}>
              Messages
            </Typography>
          </Box>
        </Box>

        {/* Recent Chats */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <RecentChats 
            userId={currentUserId} 
            onChatSelect={handleChatSelect}
          />
        </Box>

        {/* New Chat Section */}
        <Box sx={{ p: 3, borderTop: '1px solid #E5E7EB' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 2 }}>
            Start New Chat
          </Typography>
          <select 
            onChange={startNewChat} 
            defaultValue=""
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="">Select user</option>
            {allUsers
              .filter(u => u.auth0Id !== currentUserId && !chatUsers.some(c => c.auth0Id === u.auth0Id))
              .map((u) => (
                <option key={u.auth0Id} value={u.auth0Id}>
                  {u.name} ({u.role})
                </option>
              ))}
          </select>
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
          flexDirection: 'column'
        }}
      >
        {selectedUser ? (
          <ChatBox currentUserId={currentUserId} targetUserId={selectedUser.auth0Id} targetUser={selectedUser} />
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
            <Typography variant="body1" color="#6B7280" sx={{ textAlign: 'center', maxWidth: 400 }}>
              Choose a chat from the sidebar or start a new conversation to begin messaging
            </Typography>
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
    </Box>
  );
};

export default ChatContainer;
