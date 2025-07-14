import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Divider, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import { useAuth0 } from "@auth0/auth0-react";
import { fetchPendingPayments, updateConfirmedBidStatus, generatePayHereHash } from '../../services/orderService';
import PaymentIcon from "@mui/icons-material/Payment";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const PendingPayments = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [paymentDialog, setPaymentDialog] = useState({ open: false, payment: null });
  const [successMessage, setSuccessMessage] = useState('');
  const [isPayHereLoaded, setIsPayHereLoaded] = useState(false);
  const { user } = useAuth0();

  // Check if PayHere is loaded
  useEffect(() => {
    if (window.payhere && window.payhere.startPayment) {
      setIsPayHereLoaded(true);
    }
  }, []);

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

  const handleContinuePayment = (payment) => {
    setPaymentDialog({ open: true, payment });
  };

  // PayHere payment processing
  const processPayHerePayment = async (payment) => {
    if (!window.payhere) {
      alert("PayHere is not ready yet. Please wait.");
      return;
    }

    try {
      setProcessingPayment(payment._id);
      
      // Generate PayHere hash from backend
      let hash = "";
      try {
        hash = await generatePayHereHash({
          merchant_id: process.env.REACT_APP_PAYHERE_MERCHANT_ID || "1230340",
          order_id: payment.orderId || `ORDER_${Date.now()}`,
          amount: payment.amount.toFixed(2),
          currency: "LKR"
        });
      } catch (error) {
        console.error("Error generating hash:", error);
        alert("Failed to initialize payment. Please try again.");
        setProcessingPayment(null);
        return;
      }

      const paymentData = {
        sandbox: true,
        merchant_id: process.env.REACT_APP_PAYHERE_MERCHANT_ID || "1230340",
        return_url: "http://localhost:3000/merchant/purchase-history",
        cancel_url: "http://localhost:3000/merchant/payments",
        notify_url: "http://localhost:5000/api/payments/payhere-notify",
        order_id: payment.orderId || `ORDER_${Date.now()}`,
        items: payment.items.map(item => `${item.quantity}kg ${item.name}`).join(", "),
        amount: payment.amount.toFixed(2),
        currency: "LKR",
        first_name: user?.given_name || "User",
        last_name: user?.family_name || "Name",
        email: user?.email || "user@example.com",
        phone: "0771234567",
        address: "123 Farm Address",
        city: "Colombo",
        country: "Sri Lanka",
        hash: hash
      };

      window.payhere.onCompleted = function onCompleted(orderId) {
        console.log("Payment completed. OrderID:" + orderId);
        
        // Update payment status to "paid" in the backend
        updateConfirmedBidStatus(payment._id, 'paid', {
          paymentMethod: 'PayHere',
          paymentId: orderId,
          paymentAttempt: {
            method: 'PayHere',
            status: 'success',
            amount: payment.amount
          }
        }).then(() => {
          // Remove the payment from local state
          setPendingPayments(prev => prev.filter(p => p._id !== payment._id));
          
          // Show success message
          setSuccessMessage(`Payment of Rs.${payment.amount} for Order #${payment.orderId} completed successfully!`);
          
          // Clear success message after 5 seconds
          setTimeout(() => setSuccessMessage(''), 5000);
          
          // Close dialog
          setPaymentDialog({ open: false, payment: null });
          setProcessingPayment(null);
        }).catch(error => {
          console.error('Error updating payment status:', error);
          alert('Payment completed but failed to update status. Please contact support.');
          setProcessingPayment(null);
        });
      };

      window.payhere.onDismissed = function onDismissed() {
        console.log("Payment dismissed");
        setProcessingPayment(null);
      };

      window.payhere.onError = function onError(error) {
        console.log("Error:" + error);
        alert("Payment failed: " + error);
        setProcessingPayment(null);
      };

      window.payhere.startPayment(paymentData);
      
    } catch (error) {
      console.error('Error processing PayHere payment:', error);
      alert('Payment processing failed. Please try again.');
      setProcessingPayment(null);
    }
  };

  // Simulate payment processing with temporary placeholder
  const processPayment = async (payment) => {
    try {
      setProcessingPayment(payment._id);
      
      // Temporary placeholder for payment processing (2 seconds delay)
      console.log(`Processing payment for Order #${payment.orderId} - Rs.${payment.amount}`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update payment status to "paid" in the backend
      await updateConfirmedBidStatus(payment._id, 'paid', {
        paymentMethod: 'Temporary Placeholder',
        paymentId: `TMP_${Date.now()}`,
        paymentAttempt: {
          method: 'Placeholder',
          status: 'success',
          amount: payment.amount
        }
      });

      // Remove the payment from local state
      setPendingPayments(prev => prev.filter(p => p._id !== payment._id));
      
      // Show success message
      setSuccessMessage(`Payment of Rs.${payment.amount} for Order #${payment.orderId} completed successfully!`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
      
      // Close dialog
      setPaymentDialog({ open: false, payment: null });
      
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleDialogClose = () => {
    if (!processingPayment) {
      setPaymentDialog({ open: false, payment: null });
    }
  };

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
      
      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      
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
                    disabled={processingPayment === payment._id}
                  >
                    {processingPayment === payment._id ? 'Processing...' : 'Continue Payment'}
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

      {/* Payment Confirmation Dialog */}
      <Dialog 
        open={paymentDialog.open} 
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PaymentIcon sx={{ mr: 1, color: '#FFA000' }} />
            Confirm Payment
          </Box>
        </DialogTitle>
        <DialogContent>
          {paymentDialog.payment && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Order #{paymentDialog.payment.orderId}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Amount: Rs.{paymentDialog.payment.amount.toFixed(2)}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Items: {paymentDialog.payment.items.map(item => `${item.quantity}kg of ${item.name}`).join(', ')}
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                Use PayHere for secure payment processing, or choose the demo option for testing purposes.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDialogClose} 
            disabled={processingPayment}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => processPayHerePayment(paymentDialog.payment)}
            disabled={processingPayment || !isPayHereLoaded}
            startIcon={processingPayment ? <CircularProgress size={20} /> : <PaymentIcon />}
            sx={{ mr: 1 }}
          >
            {!isPayHereLoaded ? 'Loading PayHere...' : 
             processingPayment ? 'Processing...' : 'Pay with PayHere'}
          </Button>
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={() => processPayment(paymentDialog.payment)}
            disabled={processingPayment}
            startIcon={processingPayment ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {processingPayment ? 'Processing...' : 'Test Payment (Demo)'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingPayments;