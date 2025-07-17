import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Chip,
  Typography,
  InputAdornment,
  Paper,
  Fade
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  BusinessCenter as BusinessIcon,
  LocalShipping as TruckIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import './ChatFilterBar.css';

const StyledFilterBar = styled(Paper)(({ theme }) => ({
  padding: '16px',
  margin: '0',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: '0',
  borderBottom: '1px solid #E5E7EB',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
}));

const StyledSearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    borderRadius: '12px',
    fontSize: '14px',
    '& fieldset': {
      borderColor: '#E5E7EB',
    },
    '&:hover fieldset': {
      borderColor: '#D97706',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#D97706',
      borderWidth: '2px',
    },
  },
  '& .MuiInputBase-input': {
    padding: '10px 14px',
  },
}));

const FilterChip = styled(Chip)(({ theme, rolecolor }) => ({
  textTransform: 'capitalize',
  fontWeight: 600,
  fontSize: '12px',
  height: '28px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: 'transparent',
  border: `1px solid ${rolecolor || '#E5E7EB'}`,
  color: rolecolor || '#6B7280',
  '&:hover': {
    backgroundColor: `${rolecolor || '#D97706'}15`,
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  '&.active': {
    backgroundColor: rolecolor || '#D97706',
    color: 'white',
    '& .MuiChip-icon': {
      color: 'white',
    },
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

const ChatFilterBar = ({ 
  onSearchChange, 
  onRoleFilter, 
  searchTerm, 
  selectedRole,
  onClearFilters 
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');
  const roles = ['farmer', 'merchant', 'transporter'];

  // Sync external searchTerm with local state
  useEffect(() => {
    setLocalSearchTerm(searchTerm || '');
  }, [searchTerm]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm, onSearchChange]);

  const handleRoleClick = (role) => {
    if (selectedRole === role) {
      onRoleFilter(''); // Deselect if already selected
    } else {
      onRoleFilter(role);
    }
  };

  const handleClearAll = () => {
    setLocalSearchTerm('');
    onClearFilters();
  };

  const hasActiveFilters = localSearchTerm || selectedRole;

  return (
    <StyledFilterBar elevation={0}>
      {/* Search Field */}
      <StyledSearchField
        fullWidth
        placeholder="Search users by name, role, or email..."
        value={localSearchTerm}
        onChange={(e) => setLocalSearchTerm(e.target.value)}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#6B7280', fontSize: 20 }} />
            </InputAdornment>
          ),
          endAdornment: localSearchTerm && (
            <InputAdornment position="end">
              <ClearIcon 
                sx={{ 
                  color: '#6B7280', 
                  fontSize: 18, 
                  cursor: 'pointer',
                  '&:hover': { color: '#374151' }
                }} 
                onClick={() => setLocalSearchTerm('')}
              />
            </InputAdornment>
          ),
        }}
      />

      {/* Role Filters */}
      <Box sx={{ mt: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 1 
        }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#6B7280', 
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Filter by Role
          </Typography>
          {hasActiveFilters && (
            <Fade in={hasActiveFilters}>
              <Typography
                variant="caption"
                onClick={handleClearAll}
                sx={{
                  color: '#D97706',
                  cursor: 'pointer',
                  fontWeight: 600,
                  '&:hover': {
                    color: '#B45309',
                    textDecoration: 'underline',
                  },
                }}
              >
                Clear All
              </Typography>
            </Fade>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {roles.map((role) => (
            <FilterChip
              key={role}
              icon={<RoleIcon role={role} />}
              label={role}
              onClick={() => handleRoleClick(role)}
              rolecolor={getRoleColor(role)}
              className={selectedRole === role ? 'active' : ''}
              size="small"
            />
          ))}
        </Box>
      </Box>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <Fade in={hasActiveFilters}>
          <Box sx={{ 
            mt: 2, 
            pt: 2, 
            borderTop: '1px solid #F3F4F6',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>
              Active filters:
            </Typography>
            {localSearchTerm && (
              <Chip
                label={`"${localSearchTerm}"`}
                size="small"
                onDelete={() => setLocalSearchTerm('')}
                sx={{
                  fontSize: '11px',
                  height: '24px',
                  backgroundColor: '#F3F4F6',
                  '& .MuiChip-deleteIcon': {
                    fontSize: '14px',
                  },
                }}
              />
            )}
            {selectedRole && (
              <Chip
                icon={<RoleIcon role={selectedRole} />}
                label={selectedRole}
                size="small"
                onDelete={() => onRoleFilter('')}
                sx={{
                  fontSize: '11px',
                  height: '24px',
                  backgroundColor: `${getRoleColor(selectedRole)}15`,
                  color: getRoleColor(selectedRole),
                  '& .MuiChip-icon': {
                    color: getRoleColor(selectedRole),
                  },
                  '& .MuiChip-deleteIcon': {
                    fontSize: '14px',
                    color: getRoleColor(selectedRole),
                  },
                }}
              />
            )}
          </Box>
        </Fade>
      )}
    </StyledFilterBar>
  );
};

export default ChatFilterBar;
