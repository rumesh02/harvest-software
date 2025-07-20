import React, { useState, useRef } from 'react';
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
  EmojiEmotions as EmojiIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-end',
  padding: '12px 16px',
  backgroundColor: '#ffffff',
  borderTop: '1px solid #e5e7eb',
  gap: '8px',
}));

const MessageTextField = styled(TextField)(({ theme }) => ({
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
      borderColor: '#d1d5db',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#10b981',
      borderWidth: '1px',
    },
  },
  '& .MuiInputBase-input': {
    padding: '10px 14px',
    fontSize: '14px',
    lineHeight: '1.4',
  },
}));

const SendButton = styled(IconButton)(({ theme, hastext }) => ({
  backgroundColor: hastext ? '#10b981' : '#e5e7eb',
  color: hastext ? 'white' : '#9ca3af',
  width: '40px',
  height: '40px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: hastext ? '#059669' : '#d1d5db',
    transform: hastext ? 'scale(1.1)' : 'none',
  },
  '&:disabled': {
    backgroundColor: '#e5e7eb',
    color: '#9ca3af',
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
        <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderTop: '1px solid #e5e7eb' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
            </Typography>
            <IconButton size="small" onClick={() => onClearFiles && onClearFiles()}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {/* Upload Progress */}
          {isUploading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
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
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Input Container */}
      <InputContainer>
        <Tooltip title={isUploading ? `Uploading... ${uploadProgress}%` : "Attach file"}>
          <IconButton 
            sx={{ color: isUploading ? '#D97706' : '#6b7280' }}
            onClick={() => onTriggerFileSelect && onTriggerFileSelect()}
            disabled={isUploading || disabled}
          >
            {isUploading ? (
              <CircularProgress size={20} sx={{ color: '#D97706' }} />
            ) : (
              <AttachIcon />
            )}
          </IconButton>
        </Tooltip>
        
        <MessageTextField
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
        
        <IconButton sx={{ color: '#6b7280' }} disabled={disabled}>
          <EmojiIcon />
        </IconButton>
        
        <SendButton 
          hastext={hasContent ? 1 : 0}
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
