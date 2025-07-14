import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Divider, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { fetchPendingPayments } from '../../services/orderService';
import PaymentIcon from "@mui/icons-material/Payment";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axios from 'axios';

const PendingPayments = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth0();
  const navigate = useNavigate();

  // Memoize the loadPendingPayments function with useCallback
  const loadPendingPayments = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Attempting to load pending payments...");
      console.log("User ID available:", user?.sub);
      
      if (user?.sub) {
        const response = await fetchPendingPayments(user.sub);
        console.log("Pending payments response:", response);
        
        if (response && response.length > 0) {
          setPendingPayments(response);
        } else {
          console.log("No pending payments found");
        }
      }
    } catch (error) {
      console.error("Error loading pending payments:", error);
    } finally {
      setLoading(false);
    }
  }, [user]); // Add user as a dependency

  useEffect(() => {
    loadPendingPayments();
  }, [loadPendingPayments]); // Now correctly depending on the memoized function

  // Add listener for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      loadPendingPayments();
    };
    
    window.addEventListener('refreshPendingPayments', handleRefresh);
    return () => window.removeEventListener('refreshPendingPayments', handleRefresh);
  }, [loadPendingPayments]); // Now correctly depending on the memoized function

  // Import the helper functions or redefine them here
  const getUserKey = (userId, key) => `user_${userId}_${key}`;
  const setUserStorageItem = (userId, key, value) => {
    if (!userId) return;
    localStorage.setItem(getUserKey(userId, key), value);
  };

  const handleContinuePayment = (payment) => {
    if (!user?.sub) return; // Security check
    
    // Get the ID of the payment we're switching from (if any)
    const previousPaymentId = localStorage.getItem(getUserKey(user.sub, 'confirmed_bid_id'));
    
    // Log the switch if there was a previous payment
    if (previousPaymentId && previousPaymentId !== payment._id) {
      console.log(`Switching from payment ${previousPaymentId} to ${payment._id}`);
    }
    
    // Store the selected payment in user-specific localStorage
    setUserStorageItem(user.sub, 'payment_amount', payment.amount);
    setUserStorageItem(user.sub, 'confirmed_bid_id', payment._id);
    setUserStorageItem(user.sub, 'order_id', payment.orderId);
    
    // Navigate to payment page with the selected payment
    const timestamp = Date.now();
    navigate(`/merchant/payments?amount=${payment.amount}&confirmedBidId=${payment._id}&t=${timestamp}`);
  };

  // Example fetch in PendingPayments.js
  useEffect(() => {
    axios.get("/api/confirmedbids/merchant/" + user.sub)
      .then(res => {
        // Only show bids that are not paid
        setPendingPayments(res.data.filter(bid => bid.status === "Confirmed" || bid.status === "Pending"));
      });
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (pendingPayments.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Pending Payments</Typography>
        <Paper sx={{ p: 4 }}>
          <Typography>You don't have any pending payments.</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <AccessTimeIcon sx={{ mr: 1 }} /> Pending Payments
      </Typography>
      <Paper>
        <List>
          {pendingPayments.map((payment, index) => (
            <React.Fragment key={payment._id}>
              {index > 0 && <Divider />}
              <ListItem
                secondaryAction={
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PaymentIcon />}
                    onClick={() => handleContinuePayment(payment)}
                  >
                    Continue Payment
                  </Button>
                }
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle1">
                      <strong>Rs.{payment.amount.toFixed(2)}</strong> - Order #{payment.orderId}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        {payment.items.map(item => `${item.quantity}kg of ${item.name}`).join(', ')}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Created on {new Date(payment.createdAt).toLocaleDateString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default PendingPayments;