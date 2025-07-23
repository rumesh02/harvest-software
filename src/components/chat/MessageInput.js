import React, { useState, useRef, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
  Typography,
  LinearProgress
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { getRoleColor } from '../../utils/roleColors';

const InputContainer = styled(Box)(({ theme, rolecolors }) => ({
  display: 'flex',
  alignItems: 'flex-end',
  padding: '12px 16px',
  backgroundColor: '#ffffff',
  borderTop: `1.5px solid ${rolecolors?.light || '#e0e7ef'}`,
  borderRadius: '0 0 16px 16px',
  boxShadow: `0 0px 8px ${rolecolors?.primary || '#1976d2'}15`,
  gap: '8px',
}));

const MessageTextField = styled(TextField)(({ theme, rolecolors }) => ({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
    backgroundColor: '#f8f9fa',
    minHeight: '40px',
    paddingRight: '8px',
    '& fieldset': {
      borderColor: '#e5e7eb',
    },
    '&:hover fieldset': {
      borderColor: rolecolors?.secondary || '#d1d5db',
    },
    '&.Mui-focused fieldset': {
      borderColor: rolecolors?.primary || '#10b981',
      borderWidth: '2px',
      boxShadow: `0 0 0 3px ${rolecolors?.primary || '#10b981'}20`,
    },
  },
  '& .MuiInputBase-input': {
    padding: '10px 14px',
    fontSize: '14px',
    lineHeight: '1.4',
  },
}));

const SendButton = styled(IconButton)(({ theme, hastext, rolecolors }) => ({
  background: hastext ? rolecolors?.primary || '#1976d2' : '#e5e7eb',
  color: hastext ? 'white' : '#9ca3af',
  width: '44px',
  height: '44px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: hastext ? `0 4px 12px ${rolecolors?.primary || '#10b981'}40` : 'none',
  '&:hover': {
    background: hastext ? rolecolors?.dark || '#1565c0' : '#d1d5db',
    transform: hastext ? 'scale(1.05) translateY(-1px)' : 'none',
    boxShadow: hastext ? `0 8px 20px ${rolecolors?.primary || '#10b981'}50` : 'none',
  },
  '&:active': {
    transform: hastext ? 'scale(0.95)' : 'none',
  },
  '&:disabled': {
    backgroundColor: '#e5e7eb',
    color: '#9ca3af',
    transform: 'none',
    boxShadow: 'none',
  },
}));

const MessageInput = ({ 
  onSendMessage,
  onTyping,
  disabled = false,
  selectedFiles = [],
  previewFiles = [],
  uploadProgress = 0,
  isUploading = false,
  fileInputRef,
  onFileSelect,
  onRemoveFile,
  onClearFiles,
  onTriggerFileSelect,
  formatFileSize
}) => {
  const [input, setInput] = useState('');
  const typingTimeoutRef = useRef(null);

  // Get current user role for theming
  const currentUserRole = localStorage.getItem('userRole') || 'default';
  const roleColors = useMemo(() => ({
    ...getRoleColor(currentUserRole),
    role: currentUserRole
  }), [currentUserRole]);

  // Handle input changes with typing indicator
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    
    // Trigger typing indicator
    if (onTyping) {
      onTyping(true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1000);
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle send message
  const handleSend = () => {
    const messageText = input.trim();
    if (!messageText && selectedFiles.length === 0) return;
    
    if (onSendMessage) {
      onSendMessage(messageText);
    }
    
    // Clear input after sending
    setInput('');
    
    // Stop typing indicator
    if (onTyping) {
      onTyping(false);
    }
  };

  const hasContent = input.trim().length > 0 || selectedFiles.length > 0;
  const safeFormatFileSize = formatFileSize || ((bytes) => `${bytes} bytes`);
  return (
    <Box>
      {/* File Preview Area */}
      {selectedFiles.length > 0 && (
        <Box sx={{ 
          p: 2, 
          backgroundColor: roleColors.light, 
          borderTop: `1px solid ${roleColors.secondary}`, 
          borderLeft: `3px solid ${roleColors.primary}` 
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: roleColors.primary }}>
              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => onClearFiles && onClearFiles()}
              sx={{
                color: roleColors.dark,
                backgroundColor: 'white',
                '&:hover': {
                  backgroundColor: roleColors.light,
                  color: roleColors.primary,
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          {/* Upload Progress */}
          {isUploading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: roleColors.primary,
                  }
                }}
              />
              <Typography variant="caption" sx={{ color: roleColors.dark }}>
                Uploading... {uploadProgress}%
              </Typography>
            </Box>
          )}
          
          {/* File Previews */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {previewFiles.map((file, index) => (
              <Chip
                key={index}
                label={`${file.name} (${safeFormatFileSize(file.size)})`}
                onDelete={() => onRemoveFile && onRemoveFile(index)}
                variant="outlined"
                size="small"
                sx={{
                  borderColor: roleColors.secondary,
                  color: roleColors.dark,
                  backgroundColor: 'white',
                  '& .MuiChip-deleteIcon': {
                    color: roleColors.primary,
                    '&:hover': {
                      color: roleColors.dark,
                    }
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Input Container */}
      <InputContainer rolecolors={roleColors}>
        <Tooltip title={isUploading ? `Uploading... ${uploadProgress}%` : "Attach file"}>
          <IconButton 
            sx={{ 
              color: isUploading ? roleColors.secondary : '#6b7280',
              backgroundColor: 'white',
              border: `1px solid ${isUploading ? roleColors.light : '#e5e7eb'}`,
              '&:hover': {
                backgroundColor: roleColors.light,
                color: roleColors.primary,
                borderColor: roleColors.secondary,
              }
            }}
            onClick={() => onTriggerFileSelect && onTriggerFileSelect()}
            disabled={isUploading || disabled}
          >
            {isUploading ? (
              <CircularProgress size={20} sx={{ color: roleColors.primary }} />
            ) : (
              <AttachIcon />
            )}
          </IconButton>
        </Tooltip>
        
        <MessageTextField
          rolecolors={roleColors}
          multiline
          maxRows={4}
          placeholder={isUploading ? `Uploading file... ${uploadProgress}%` : "Type a message..."}
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          variant="outlined"
          size="small"
          disabled={isUploading || disabled}
        />
        
        <SendButton 
          hastext={hasContent ? 1 : 0}
          rolecolors={roleColors}
          onClick={handleSend}
          disabled={!hasContent || disabled}
        >
          <SendIcon />
        </SendButton>

        {/* Hidden file input for uploads */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => onFileSelect && onFileSelect(e)}
          style={{ display: 'none' }}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          multiple
        />
      </InputContainer>
    </Box>
  );
};

export default MessageInput;
