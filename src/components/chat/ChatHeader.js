import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import {
  Phone as PhoneIcon,
  VideoCall as VideoIcon,
  MoreVert as MoreIcon,
  Info as InfoIcon,
  ClearAll as ClearIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { formatTime } from '../../utils/chatUtils';

const StyledChatHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  zIndex: 10,
}));

const ChatHeader = ({ targetUser, isOnline, lastSeen, onClose, onClearChat, currentUserId }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleClearChatClick = () => {
    handleMenuClose();
    setClearDialogOpen(true);
  };

  const handleClearChatConfirm = () => {
    setClearDialogOpen(false);
    if (onClearChat) {
      onClearChat();
    }
  };

  const handleClearChatCancel = () => {
    setClearDialogOpen(false);
  };

  return (
    <StyledChatHeader>
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
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <InfoIcon sx={{ mr: 1 }} />
          Chat Info
        </MenuItem>
        <MenuItem onClick={handleClearChatClick} sx={{ color: '#EF4444' }}>
          <ClearIcon sx={{ mr: 1 }} />
          Clear My Chat History
        </MenuItem>
      </Menu>

      {/* Clear Chat Confirmation Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={handleClearChatCancel}
        aria-labelledby="clear-chat-dialog-title"
        aria-describedby="clear-chat-dialog-description"
      >
        <DialogTitle id="clear-chat-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon sx={{ color: '#EF4444' }} />
          Clear My Chat History
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="clear-chat-dialog-description">
            Are you sure you want to clear your chat history with {targetUser?.name}? 
            This will only remove the chat history from your account. {targetUser?.name} will still be able to see all messages.
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearChatCancel} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleClearChatConfirm} 
            color="error" 
            variant="contained"
            sx={{ ml: 1 }}
          >
            Clear My History
          </Button>
        </DialogActions>
      </Dialog>
    </StyledChatHeader>
  );
};

export default ChatHeader;
