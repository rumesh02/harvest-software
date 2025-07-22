import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Chat service functions for managing chat operations
 */
export const chatService = {
  /**
   * Clear chat history between two users (user-specific)
   * @param {string} user1 - First user ID
   * @param {string} user2 - Second user ID  
   * @param {string} currentUserId - ID of user requesting the clear
   * @returns {Promise<Object>} Response from the API
   */
  clearChatHistory: async (user1, user2, currentUserId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/messages/clear/${user1}/${user2}`,
        { userId: currentUserId }
      );
      return response.data;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  },

  /**
   * Send a message
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} Response from the API
   */
  sendMessage: async (messageData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/messages/send`, messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Get messages between two users
   * @param {string} user1 - First user ID
   * @param {string} user2 - Second user ID
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of messages per page
   * @returns {Promise<Object>} Response from the API
   */
  getMessages: async (user1, user2, page = 1, limit = 50) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/messages/${user1}/${user2}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },

  /**
   * Mark messages as read
   * @param {string} userId - User ID
   * @param {string} senderId - Sender ID
   * @returns {Promise<Object>} Response from the API
   */
  markAsRead: async (userId, senderId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/messages/read/${userId}/${senderId}`);
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  /**
   * Delete a specific message
   * @param {string} messageId - Message ID to delete
   * @param {string} userId - User ID requesting the deletion
   * @returns {Promise<Object>} Response from the API
   */
  deleteMessage: async (messageId, userId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/messages/${messageId}`, {
        data: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
};

export default chatService;
