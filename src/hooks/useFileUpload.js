import { useState, useRef } from 'react';
import axios from 'axios';

export const useFileUpload = (currentUserId, targetUserId, targetUser) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);
  
  const fileInputRef = useRef(null);

  // File validation
  const validateFile = (file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.size > maxSize) {
      throw new Error(`File "${file.name}" is too large. Maximum size is 50MB.`);
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type "${file.type}" is not supported.`);
    }

    return true;
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    try {
      // Validate all files
      files.forEach(validateFile);
      
      setSelectedFiles(files);
      
      // Create preview data
      const previews = files.map(file => ({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }));
      
      setPreviewFiles(previews);
      
    } catch (error) {
      alert(error.message);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove file from selection
  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewFiles.filter((_, i) => i !== index);
    
    // Cleanup preview URLs
    if (previewFiles[index]?.preview) {
      URL.revokeObjectURL(previewFiles[index].preview);
    }
    
    setSelectedFiles(newFiles);
    setPreviewFiles(newPreviews);
    
    // Clear file input if no files selected
    if (newFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload files
  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return [];

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', currentUserId);

        const response = await axios.post('http://localhost:5000/api/files/upload/single', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              ((index + progressEvent.loaded / progressEvent.total) / selectedFiles.length) * 100
            );
            setUploadProgress(percentCompleted);
          }
        });

        return {
          url: response.data.file.url,
          filename: response.data.file.filename,
          originalName: file.name,
          fileType: file.type,
          fileSize: file.size
        };
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      // Clear selected files after successful upload
      clearSelectedFiles();
      
      return uploadResults;
      
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Send message with files
  const sendMessageWithFiles = async (messageText, onMessageSent) => {
    try {
      const uploadedFiles = await uploadFiles();
      
      for (const fileData of uploadedFiles) {
        const messageData = {
          senderId: currentUserId,
          receiverId: targetUserId,
          message: messageText || `📎 ${fileData.originalName}`,
          fileUrl: fileData.url,
          fileName: fileData.originalName,
          fileType: fileData.fileType,
          fileSize: fileData.fileSize,
          timestamp: new Date(),
          senderName: targetUser?.name || 'Unknown User'
        };

        // Call the message sent callback
        if (onMessageSent) {
          onMessageSent(messageData);
        }
      }
      
    } catch (error) {
      console.error('Error sending message with files:', error);
      throw error;
    }
  };

  // Clear selected files
  const clearSelectedFiles = () => {
    // Cleanup preview URLs
    previewFiles.forEach(preview => {
      if (preview.preview) {
        URL.revokeObjectURL(preview.preview);
      }
    });
    
    setSelectedFiles([]);
    setPreviewFiles([]);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file selection
  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    uploadProgress,
    isUploading,
    selectedFiles,
    previewFiles,
    fileInputRef,
    handleFileSelect,
    removeFile,
    uploadFiles,
    sendMessageWithFiles,
    clearSelectedFiles,
    triggerFileSelect,
    formatFileSize,
    validateFile
  };
};
