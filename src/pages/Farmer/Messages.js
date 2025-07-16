import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Divider,
  Badge,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Chip
} from "@mui/material";
import {
  Message as MessageIcon,
  Send as SendIcon,
  Search as SearchIcon,
  Circle as CircleIcon
} from "@mui/icons-material";

const Messages = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Nimal Perera",
      lastMessage: "Hello, I'm interested in your carrot harvest. Can we discuss the price?",
      timestamp: "2025-01-15 14:30",
      unread: 2,
      avatar: "N",
      isOnline: true
    },
    {
      id: 2,
      sender: "Kamal Silva",
      lastMessage: "Thank you for the quality onions. Looking forward to more business.",
      timestamp: "2025-01-15 10:15",
      unread: 0,
      avatar: "K",
      isOnline: false
    },
    {
      id: 3,
      sender: "Sunil Fernando",
      lastMessage: "When will the potato harvest be ready?",
      timestamp: "2025-01-14 16:45",
      unread: 1,
      avatar: "S",
      isOnline: true
    }
  ]);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hello, I'm interested in your carrot harvest. Can we discuss the price?",
      sender: "merchant",
      timestamp: "14:30"
    },
    {
      id: 2,
      text: "Hello! Sure, I'd be happy to discuss. The current price is Rs. 120 per kg. What quantity are you looking for?",
      sender: "farmer",
      timestamp: "14:35"
    },
    {
      id: 3,
      text: "I need about 500kg. Can you offer any discount for bulk purchase?",
      sender: "merchant",
      timestamp: "14:40"
    }
  ]);

  const filteredMessages = messages.filter(message =>
    message.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedMessage) {
      const newChatMessage = {
        id: chatMessages.length + 1,
        text: newMessage,
        sender: "farmer",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, newChatMessage]);
      setNewMessage("");
    }
  };

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    // Mark as read
    setMessages(messages.map(msg => 
      msg.id === message.id ? { ...msg, unread: 0 } : msg
    ));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
        <MessageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Messages
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, height: '70vh' }}>
        {/* Messages List */}
        <Paper sx={{ flex: 1, maxWidth: 400, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
            {filteredMessages.map((message) => (
              <React.Fragment key={message.id}>
                <ListItem
                  button
                  onClick={() => handleSelectMessage(message)}
                  selected={selectedMessage?.id === message.id}
                  sx={{
                    '&:hover': { backgroundColor: '#f5f5f5' },
                    '&.Mui-selected': { backgroundColor: '#e8f5e8' }
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: message.isOnline ? '#44b700' : '#gray',
                          color: message.isOnline ? '#44b700' : '#gray'
                        }
                      }}
                    >
                      <Avatar sx={{ bgcolor: '#2e7d32' }}>
                        {message.avatar}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: message.unread > 0 ? 'bold' : 'normal' }}>
                          {message.sender}
                        </Typography>
                        {message.unread > 0 && (
                          <Chip
                            label={message.unread}
                            color="primary"
                            size="small"
                            sx={{ minWidth: 20, height: 20 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            fontWeight: message.unread > 0 ? 'bold' : 'normal'
                          }}
                        >
                          {message.lastMessage}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          {message.timestamp}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>

        {/* Chat Area */}
        <Paper sx={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
          {selectedMessage ? (
            <>
              {/* Chat Header */}
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#2e7d32', mr: 2 }}>
                  {selectedMessage.avatar}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedMessage.sender}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedMessage.isOnline ? 'Online' : 'Offline'}
                    <CircleIcon 
                      sx={{ 
                        ml: 1, 
                        fontSize: 8, 
                        color: selectedMessage.isOnline ? '#44b700' : '#gray',
                        verticalAlign: 'middle' 
                      }} 
                    />
                  </Typography>
                </Box>
              </Box>

              {/* Chat Messages */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {chatMessages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.sender === 'farmer' ? 'flex-end' : 'flex-start',
                      mb: 2
                    }}
                  >
                    <Card
                      sx={{
                        maxWidth: '70%',
                        bgcolor: msg.sender === 'farmer' ? '#2e7d32' : '#f5f5f5',
                        color: msg.sender === 'farmer' ? 'white' : 'text.primary'
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="body2">{msg.text}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            textAlign: 'right',
                            mt: 1,
                            opacity: 0.7
                          }}
                        >
                          {msg.timestamp}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>

              {/* Message Input */}
              <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    multiline
                    maxRows={3}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    sx={{ bgcolor: '#2e7d32', color: 'white', '&:hover': { bgcolor: '#1b5e20' } }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Box sx={{ textAlign: 'center' }}>
                <MessageIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Select a conversation to start messaging
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Messages;
