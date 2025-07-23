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
  '&:hover': {
    backgroundColor: '#FFF8EC',
    transform: 'translateX(4px)',
    boxShadow: '0 2px 8px rgba(217, 119, 6, 0.15)',
  },
}));

const RoleIcon = ({ role }) => {
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

  // Filter users based on search term and role
  useEffect(() => {
    let filtered = users.filter(user => user.auth0Id !== currentUserId);

    // Apply search filter
    if (searchTerm?.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchLower) ||
        user.role?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }

    // Apply role filter
    if (selectedRole) {
      filtered = filtered.filter(user => 
        user.role?.toLowerCase() === selectedRole.toLowerCase()
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole, currentUserId]);

  const handleUserClick = (user) => {
    onUserSelect(user);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '200px'
      }}>
        <CircularProgress size={32} sx={{ color: '#D97706' }} />
      </Box>
    );
  }

  if (!searchTerm && !selectedRole) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        p: 4,
        color: '#6B7280'
      }}>
        <SearchIcon sx={{ fontSize: 48, color: '#E5E7EB', mb: 2 }} />
        <Typography variant="body2" sx={{ mb: 1 }}>
          Use the search bar above to find users
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Search by name, role, or email, or filter by role
        </Typography>
      </Box>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        p: 4,
        color: '#6B7280'
      }}>
        <SearchIcon sx={{ fontSize: 48, color: '#E5E7EB', mb: 2 }} />
        <Typography variant="body2" sx={{ mb: 1 }}>
          No users found
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Try adjusting your search terms or filters
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Results Header */}
      <Box sx={{ 
        p: 2, 
        pb: 1,
        borderBottom: '1px solid #F3F4F6',
        backgroundColor: '#FAFAFA'
      }}>
        <Typography variant="caption" sx={{ 
          color: '#6B7280',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
        </Typography>
      </Box>

      {/* User List */}
      <StyledUserList>
        {filteredUsers.map((user, index) => (
          <Fade in={true} timeout={300 + (index * 50)} key={user.auth0Id}>
            <div>
              <UserListItem onClick={() => handleUserClick(user)}>
                <ListItemAvatar>
                  <Avatar
                    src={user.picture}
                    alt={user.name}
                    sx={{
                      width: 40,
                      height: 40,
                      border: `2px solid ${getRoleColor(user.role).primary}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle2"
                      sx={{ 
                        fontWeight: 600, 
                        color: '#1F2937',
                        mb: 0.5
                      }}
                    >
                      {user.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Chip
                        icon={<RoleIcon role={user.role} />}
                        label={user.role}
                        size="small"
                        sx={{
                          height: '20px',
                          fontSize: '11px',
                          backgroundColor: `${getRoleColor(user.role).primary}15`,
                          color: getRoleColor(user.role).primary,
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          alignSelf: 'flex-start',
                          '& .MuiChip-icon': {
                            color: getRoleColor(user.role).primary,
                            fontSize: '14px',
                          },
                        }}
                      />
                      {user.email && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                          {user.email}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </UserListItem>
              {index < filteredUsers.length - 1 && (
                <Divider sx={{ mx: 2, opacity: 0.3 }} />
              )}
            </div>
          </Fade>
        ))}
      </StyledUserList>
    </Box>
  );
};

export default FilteredUserList;
