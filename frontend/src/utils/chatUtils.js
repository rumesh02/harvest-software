// Chat utility functions for date formatting, message grouping, etc.

export const groupMessagesByDate = (messages) => {
  const groups = {};
  messages.forEach(msg => {
    const date = new Date(msg.timestamp).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
  });
  return groups;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (date.toDateString() === today) return 'Today';
  if (date.toDateString() === yesterday) return 'Yesterday';
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateFile = (file) => {
  const maxSizeInMB = 10;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  
  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeInMB}MB limit. Please select a smaller file.`
    };
  }

  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Please upload images, PDFs, or documents.'
    };
  }

  return { valid: true };
};
