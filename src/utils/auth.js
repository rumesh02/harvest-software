/**
 * Auth utilities for managing tokens
 */

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The authentication token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem('auth_token');
};

/**
 * Save authentication token to localStorage
 * @param {string} token - The token to save
 */
export const saveToken = (token) => {
  localStorage.setItem('auth_token', token);
};

/**
 * Remove the authentication token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem('auth_token');
};

/**
 * Check if user is authenticated (has a token)
 * @returns {boolean} Whether the user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};