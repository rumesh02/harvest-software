import React, { useState, useMemo } from 'react';
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
  MoreVert as MoreIcon,
  ClearAll as ClearIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { formatTime } from '../../utils/chatUtils';
import { getRoleColor } from '../../utils/roleColors';

const StyledChatHeader = styled(Box)(({ theme, rolecolors }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '16px 20px',
  background: rolecolors?.primary || '#1976d2',
  borderBottom: `2px solid ${rolecolors?.dark || '#1976d2'}`,
  boxShadow: `0 4px 12px ${rolecolors?.primary || '#1976d2'}30`,
  borderRadius: '16px 16px 0 0',
  zIndex: 10,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: rolecolors?.dark || '#1565c0',
  }
}));

const ChatHeader = ({ targetUser, isOnline, lastSeen, onClose, onClearChat, currentUserId }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  // Get current user role for theming
  const currentUserRole = localStorage.getItem('userRole') || 'default';
  const roleColors = useMemo(() => ({
    ...getRoleColor(currentUserRole),
    role: currentUserRole
  }), [currentUserRole]);

  // Get target user role color for avatar
  const targetUserRole = targetUser?.role || 'default';
  const targetRoleColors = useMemo(() => getRoleColor(targetUserRole), [targetUserRole]);

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
    <StyledChatHeader rolecolors={roleColors}>
      <Avatar
        src={targetUser?.picture}
        alt={targetUser?.name}
        sx={{ 
          width: 48, 
          height: 48, 
          mr: 2,
          border: `3px solid ${targetRoleColors.primary}`,
          boxShadow: `0 4px 12px ${targetRoleColors.primary}40`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: `0 6px 16px ${targetRoleColors.primary}60`,
          }
        }}
      >
        {targetUser?.name?.charAt(0).toUpperCase()}
      </Avatar>
      
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" sx={{ 
          fontWeight: 600, 
          color: 'white',
          fontSize: '1.1rem',
          textShadow: '0 1px 2px rgba(0,0,0,0.2)'
        }}>
          {targetUser?.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="caption" sx={{ 
            color: 'rgba(255,255,255,0.9)',
            fontSize: '0.85rem',
            textShadow: '0 1px 1px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            {isOnline ? (
              <>
                <Badge
                  variant="dot"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#4ade80',
                      width: 8,
                      height: 8,
                      boxShadow: '0 0 0 2px white',
                    },
                  }}
                />
                Online
              </>
            ) : (
              `Last seen ${lastSeen ? formatTime(lastSeen) : 'recently'}`
            )}
          </Typography>
          
          {/* Role Badge */}
          <Box sx={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            px: 1.5,
            py: 0.3,
            borderRadius: 2,
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'capitalize',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            {targetUserRole}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="More options">
          <IconButton 
            sx={{ 
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
                transform: 'scale(1.05)',
              }
            }}
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
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: `0 8px 32px ${roleColors.primary}30`,
            border: `1px solid ${roleColors.light}`,
          }
        }}
      >
        <MenuItem 
          onClick={handleClearChatClick} 
          sx={{ 
            color: '#EF4444',
            '&:hover': {
              backgroundColor: '#fee2e2',
            }
          }}
        >
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
