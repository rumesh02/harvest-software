import api from './api';

export const fetchOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export const fetchOrdersByMerchant = async (status = null) => {
  const params = status ? { status } : {};
  const response = await api.get('/orders/merchant', { params });
  return response.data;
};

export const updateOrderStatus = async (orderId, status, additionalData = {}) => {
  const response = await api.put(`/orders/${orderId}/status`, {
    status,
    ...additionalData
  });
  return response.data;
};

export const confirmOrder = async (orderData) => {
  const response = await api.post('/orders/confirm', orderData);
  return response.data;
};

export const fetchConfirmedBidById = async (bidId) => {
  try {
    // Remove the extra /api/ since it's already in your baseURL
    const response = await api.get(`/confirmedbids/${bidId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching confirmed bid:", error);
    throw error;
  }
};

// Add this new function to fetch pending payments
export const fetchPendingPayments = async (merchantId) => {
  try {
    console.log(`Making API call to fetch pending payments for merchant: ${merchantId}`);
    const response = await api.get(`/confirmedbids/merchant/${merchantId}/pending`);
    console.log("API response for pending payments:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    console.error("Error details:", error.response?.data || error.message);
    return []; // Return empty array on error
  }
};

// Add this new function to update payment status
export const updatePaymentStatus = async (confirmedBidId, status, paymentDetails = {}) => {
  try {
    console.log(`Updating payment status for confirmedBid: ${confirmedBidId} to ${status}`);
    const response = await api.put(`/confirmedbids/${confirmedBidId}/status`, {
      status,
      paymentMethod: paymentDetails.paymentMethod,
      paymentId: paymentDetails.paymentId,
      paymentAttempt: paymentDetails.paymentAttempt
    });
    return response.data;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
};

// Add function to fetch completed payments (paid status)
export const fetchCompletedPayments = async (merchantId) => {
  try {
    console.log(`Fetching completed payments for merchant: ${merchantId}`);
    const response = await api.get(`/confirmedbids/merchant/${merchantId}/completed`);
    return response.data;
  } catch (error) {
    console.error("Error fetching completed payments:", error);
    return []; // Return empty array on error
  }
};