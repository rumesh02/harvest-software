import React, { useState } from 'react';
import { Box, Typography, Button, Select, MenuItem, FormControl, InputLabel, Paper } from '@mui/material';
import MessageInput from '../components/chat/MessageInput';
import MessageList from '../components/chat/MessageList';
import ChatHeader from '../components/chat/ChatHeader';

const ChatThemeDemo = () => {
  const [currentRole, setCurrentRole] = useState('farmer');
  const [messages, setMessages] = useState([
    {
      id: 1,
      senderId: 'user1',
      message: 'Hello! How are you?',
      timestamp: new Date(Date.now() - 60000),
      status: 'read'
    },
    {
      id: 2,
      senderId: 'user2', 
      message: 'I am doing great! How about you?',
      timestamp: new Date(Date.now() - 30000),
      status: 'delivered'
    },
    {
      id: 3,
      senderId: 'user1',
      message: 'Excellent! The new chat UI looks amazing with role-based colors!',
      timestamp: new Date(),
      status: 'sent'
    }
  ]);
  const [typing, setTyping] = useState(false);

  const targetUser = {
    name: 'John Doe',
    role: 'merchant',
    picture: null,
    auth0Id: 'user2'
  };

  const handleRoleChange = (event) => {
    const newRole = event.target.value;
    setCurrentRole(newRole);
    localStorage.setItem('userRole', newRole);
    // Force component re-render
    window.location.reload();
  };

  const handleSendMessage = (messageText) => {
    const newMessage = {
      id: messages.length + 1,
      senderId: 'user1',
      message: messageText,
      timestamp: new Date(),
      status: 'sending'
    };
    setMessages([...messages, newMessage]);
  };

  const handleTyping = (isTyping) => {
    setTyping(isTyping);
  };

  return (
    <Box sx={{ p: 3, background: '#f0f9ff', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#1976d2', fontWeight: 700 }}>
        📱 Enhanced Chat UI - Role-Based Theme Demo
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Select Your Role</InputLabel>
          <Select
            value={currentRole}
            onChange={handleRoleChange}
            label="Select Your Role"
          >
            <MenuItem value="farmer">🌾 Farmer</MenuItem>
            <MenuItem value="merchant">🏪 Merchant</MenuItem>
            <MenuItem value="transporter">🚚 Transporter</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
          Current role: <strong style={{ textTransform: 'capitalize' }}>{currentRole}</strong>
        </Typography>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          maxWidth: 800, 
          height: 600, 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}
      >
        <ChatHeader 
          targetUser={targetUser}
          isOnline={true}
          currentUserId="user1"
          onClose={() => console.log('Close chat')}
          onClearChat={() => console.log('Clear chat')}
        />
        
        <MessageList 
          messages={messages}
          currentUserId="user1"
          targetUser={targetUser}
          typing={typing}
        />
        
        <MessageInput 
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          selectedFiles={[]}
          previewFiles={[]}
          uploadProgress={0}
          isUploading={false}
          formatFileSize={(bytes) => `${(bytes / 1024).toFixed(1)} KB`}
        />
      </Paper>

      <Box sx={{ mt: 3, p: 2, backgroundColor: 'white', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
          🎨 Theme Features:
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • <strong>Role-based colors:</strong> Each user role (Farmer, Merchant, Transporter) has distinct color themes
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • <strong>Enhanced message bubbles:</strong> Gradient backgrounds, improved shadows, and smooth animations
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • <strong>Improved header:</strong> Gradient background, role badges, and better typography
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • <strong>Better input area:</strong> Focus states, file upload indicators, and send button animations
        </Typography>
        <Typography variant="body2">
          • <strong>Typing indicator:</strong> Role-themed colors and smooth animations
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatThemeDemo;
