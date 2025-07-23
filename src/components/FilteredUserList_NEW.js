import React, { useState, useEffect } from 'react';
import { getRoleColor } from '../utils/roleColors';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Chip,
  CircularProgress,
  Fade,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  BusinessCenter as BusinessIcon,
  LocalShipping as TruckIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledUserList = styled(List)(({ theme }) => ({
  padding: '8px',
  maxHeight: 'calc(100% - 60px)',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#c1c1c1',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#a8a8a8',
  },
}));

const UserListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: '12px',
  margin: '2px 0',
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
}));

// Role icon component
const getRoleIcon = (role) => {
  const iconProps = { sx: { fontSize: 16 } };
  
  switch (role?.toLowerCase()) {
    case 'farmer':
      return <PersonIcon {...iconProps} />;
    case 'merchant':
      return <BusinessIcon {...iconProps} />;
    case 'transporter':
      return <TruckIcon {...iconProps} />;
    default:
      return <PersonIcon {...iconProps} />;
  }
};

const FilteredUserList = ({ 
  users = [], 
  searchTerm, 
  selectedRole, 
  onUserSelect, 
  currentUserId,
  loading = false 
}) => {
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Get current user role for theming
  const currentUserRole = localStorage.getItem('userRole') || 'merchant';
  const currentUserRoleColors = getRoleColor(currentUserRole);

  // Filter users based on search term and selected role
  useEffect(() => {
    let filtered = users.filter(user => user.auth0Id !== currentUserId);

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.role?.toLowerCase().includes(searchLower)
      );
    }

    if (selectedRole) {
      filtered = filtered.filter(user => 
        user.role?.toLowerCase() === selectedRole.toLowerCase()
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole, currentUserId]);

  const handleUserClick = (user) => {
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  // Loading state
  if (loading && users.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={32} sx={{ color: currentUserRoleColors.primary }} />
        <Typography variant="body2" color="text.secondary">
          Loading users...
        </Typography>
      </Box>
    );
  }

  // No results state
  if (filteredUsers.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        flexDirection: 'column',
        gap: 2,
        p: 3
      }}>
        <SearchIcon sx={{ fontSize: 64, color: '#e5e7eb' }} />
        <Typography variant="h6" color="#6B7280" gutterBottom>
          No users found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {searchTerm || selectedRole 
            ? 'Try adjusting your search filters'
            : 'Start typing to search for users'
          }
        </Typography>
      </Box>
    );
  }

  return (
    <StyledUserList>
      {filteredUsers.map((user, index) => (
        <Fade in={true} timeout={300} key={user.auth0Id || index}>
          <div>
            {index > 0 && <Divider />}
            <UserListItem 
              onClick={() => handleUserClick(user)}
              sx={{
                '&:hover': {
                  backgroundColor: `${currentUserRoleColors.primary}10`,
                  transform: 'translateX(4px)',
                  boxShadow: `0 2px 8px ${currentUserRoleColors.primary}20`,
                },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={user.picture && user.picture !== "/placeholder.svg" ? user.picture : undefined}
                  alt={user.name}
                  sx={{ 
                    width: 44, 
                    height: 44,
                    bgcolor: getRoleColor(user.role).primary,
                    border: `2px solid ${getRoleColor(user.role).primary}`,
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#1F2937',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {user.name}
                    </Typography>
                    {user.role && (
                      <Chip
                        icon={getRoleIcon(user.role)}
                        label={user.role}
                        size="small"
                        sx={{
                          height: '22px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: `${getRoleColor(user.role).primary}15`,
                          color: getRoleColor(user.role).primary,
                          textTransform: 'capitalize',
                          '& .MuiChip-icon': {
                            color: getRoleColor(user.role).primary,
                            fontSize: '14px',
                          },
                        }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#6B7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.85rem'
                    }}
                  >
                    {user.email}
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
            </UserListItem>
          </div>
        </Fade>
      ))}
    </StyledUserList>
  );
};

export default FilteredUserList;
