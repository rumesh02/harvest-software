import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Phone as PhoneIcon,
  VideoCall as VideoIcon,
  MoreVert as MoreIcon,
  Info as InfoIcon
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

const ChatHeader = ({ targetUser, isOnline, lastSeen, onClose }) => {
  const [anchorEl, setAnchorEl] = useState(null);

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
    </StyledChatHeader>
  );
};

export default ChatHeader;
