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

// Add function to update confirmed bid status
export const updateConfirmedBidStatus = async (bidId, status, additionalData = {}) => {
  try {
    const response = await api.put(`/confirmedbids/${bidId}/status`, {
      status,
      ...additionalData
    });
    return response.data;
  } catch (error) {
    console.error("Error updating confirmed bid status:", error);
    throw error;
  }
};

// Update payment status - specialized function for payment updates
export const updatePaymentStatus = async (bidId, status, paymentData = {}) => {
  try {
    const response = await api.put(`/confirmedbids/${bidId}/status`, {
      status,
      ...paymentData
    });
    return response.data;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
};

// Generate PayHere payment hash
export const generatePayHereHash = async (paymentData) => {
  try {
    const params = new URLSearchParams({
      orderId: paymentData.order_id,
      amount: paymentData.amount,
      currency: paymentData.currency || 'LKR'
    });
    const response = await api.get(`/payments/generate-hash?${params.toString()}`);
    return response.data.hash;
  } catch (error) {
    console.error("Error generating PayHere hash:", error);
    throw error;
  }
};