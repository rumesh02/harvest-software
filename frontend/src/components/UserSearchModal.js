import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Chip,
  InputAdornment,
  CircularProgress,
  Paper,
  IconButton,
  Slide,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  BusinessCenter as BusinessIcon,
  LocalShipping as TruckIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import './UserSearchModal.css';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    minWidth: '500px',
    maxWidth: '600px',
    maxHeight: '70vh',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: '0',
  backgroundColor: 'white',
  color: theme.palette.text.primary,
  borderBottomLeftRadius: '16px',
  borderBottomRightRadius: '16px',
}));

const SearchTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    borderRadius: '12px',
    '& fieldset': {
      borderColor: 'rgba(255,255,255,0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255,255,255,0.6)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'white',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.8)',
  },
  '& .MuiInputBase-input': {
    color: theme.palette.text.primary,
  },
}));

const UserListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: '12px',
  margin: '4px 8px',
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#f8f9fa',
    transform: 'translateX(4px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
}));

const RoleIcon = ({ role }) => {
  const iconProps = { sx: { fontSize: 18, mr: 0.5 } };
  
  switch (role?.toLowerCase()) {
    case 'farmer':
      return <PersonIcon {...iconProps} sx={{ ...iconProps.sx, color: '#059669' }} />;
    case 'merchant':
      return <BusinessIcon {...iconProps} sx={{ ...iconProps.sx, color: '#dc2626' }} />;
    case 'transporter':
      return <TruckIcon {...iconProps} sx={{ ...iconProps.sx, color: '#2563eb' }} />;
    default:
      return <PersonIcon {...iconProps} sx={{ ...iconProps.sx, color: '#6b7280' }} />;
  }
};

const getRoleColor = (role) => {
  switch (role?.toLowerCase()) {
    case 'farmer':
      return '#059669';
    case 'merchant':
      return '#dc2626';
    case 'transporter':
      return '#2563eb';
    default:
      return '#6b7280';
  }
};

const UserSearchModal = ({ 
  open, 
  onClose, 
  onUserSelect, 
  allUsers = [], 
  currentUserId,
  excludeUserIds = [] 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const theme = useTheme();

  // Filter users based on search term
  useEffect(() => {
    if (!allUsers.length) return;

    setLoading(true);
    const timer = setTimeout(() => {
      const filtered = allUsers.filter(user => {
        // Exclude current user and any users in excludeUserIds array
        if (user.auth0Id === currentUserId || excludeUserIds.includes(user.auth0Id)) {
          return false;
        }

        // Filter by search term
        if (!searchTerm.trim()) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
          user.name?.toLowerCase().includes(searchLower) ||
          user.role?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
        );
      });

      setFilteredUsers(filtered);
      setLoading(false);
    }, 200); // Debounce search

    return () => clearTimeout(timer);
  }, [searchTerm, allUsers, currentUserId, excludeUserIds]);

  // Focus search input when modal opens
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => {
        searchRef.current.focus();
      }, 100);
    }
  }, [open]);

  const handleUserClick = (user) => {
    onUserSelect(user);
    handleClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setFilteredUsers([]);
    onClose();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      keepMounted={false}
      onKeyDown={handleKeyDown}
    >
      <DialogTitle
        sx={{
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SearchIcon sx={{ mr: 1, fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Start New Conversation
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <StyledDialogContent>
        {/* Search Input */}
        <Box sx={{ p: 3, pb: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <SearchTextField
            ref={searchRef}
            fullWidth
            placeholder="Search by name, role, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(0,0,0,0.5)' }} />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            size="medium"
          />
        </Box>

        {/* User List */}
        <Box sx={{ maxHeight: '400px', overflow: 'auto', pb: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <SearchIcon sx={{ fontSize: 48, color: '#e5e7eb', mb: 2 }} />
              <Typography variant="body1" color="textSecondary">
                {searchTerm ? 'No users found' : 'Type to search for users'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ pt: 1 }}>
              {filteredUsers.map((user) => (
                <UserListItem
                  key={user.auth0Id}
                  onClick={() => handleUserClick(user)}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={user.picture}
                      alt={user.name}
                      sx={{
                        width: 48,
                        height: 48,
                        border: `2px solid ${getRoleColor(user.role)}`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    >
                      {user.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, color: '#1f2937' }}
                        >
                          {user.name}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          icon={<RoleIcon role={user.role} />}
                          label={user.role}
                          size="small"
                          sx={{
                            backgroundColor: `${getRoleColor(user.role)}15`,
                            color: getRoleColor(user.role),
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            '& .MuiChip-icon': {
                              color: getRoleColor(user.role),
                            },
                          }}
                        />
                        {user.email && (
                          <Typography variant="caption" color="textSecondary">
                            {user.email}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </UserListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Quick filters */}
        {!searchTerm && (
          <Paper sx={{ m: 2, p: 2, backgroundColor: '#f8f9fa' }}>
            <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
              Quick filters:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['farmer', 'merchant', 'transporter'].map((role) => (
                <Chip
                  key={role}
                  label={role}
                  size="small"
                  onClick={() => setSearchTerm(role)}
                  sx={{
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: `${getRoleColor(role)}20`,
                      color: getRoleColor(role),
                    },
                  }}
                />
              ))}
            </Box>
          </Paper>
        )}
      </StyledDialogContent>
    </StyledDialog>
  );
};

export default UserSearchModal;
