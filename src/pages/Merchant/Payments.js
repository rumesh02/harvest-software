import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, Alert, Paper } from "@mui/material";
import AppleIcon from "@mui/icons-material/Apple";
import PaymentIcon from "@mui/icons-material/Payment";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useSearchParams, useNavigate } from "react-router-dom";
import { fetchConfirmedBidById } from "../../services/orderService";
import { useAuth0 } from "@auth0/auth0-react";
import PendingPayments from "./PendingPayments";
import axios from "axios"; // Add this import

// Helper functions for user-specific localStorage 
const getUserKey = (userId, key) => `user_${userId}_${key}`;
const setUserStorageItem = (userId, key, value) => {
  if (!userId) return;
  localStorage.setItem(getUserKey(userId, key), value);
};
const getUserStorageItem = (userId, key) => {
  if (!userId) return null;
  return localStorage.getItem(getUserKey(userId, key));
};
const removeUserStorageItem = (userId, key) => {
  if (!userId) return;
  localStorage.removeItem(getUserKey(userId, key));
};

const Payments = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth0();
  
  // State variables
  const [amount, setAmount] = useState(parseFloat(searchParams.get("amount")) || 0);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [confirmedBidId, setConfirmedBidId] = useState(searchParams.get("confirmedBidId") || null);
  const [showPendingPayments, setShowPendingPayments] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [showSwitchNotification, setShowSwitchNotification] = useState(false);
  const [isPayHereLoaded, setIsPayHereLoaded] = useState(false);
  
  // Store initial searchParams in a ref to access it once without dependencies
  const initialSearchParams = useRef(searchParams);
  
  // Check if PayHere is loaded
  useEffect(() => {
    if (window.payhere && window.payhere.startPayment) {
      setIsPayHereLoaded(true);
    }
  }, []);

  // Regular payment data loading (on initial mount)
  useEffect(() => {
    const loadPaymentData = async () => {
      // Only proceed if we have a valid user
      if (!user?.sub) {
        return;
      }

      // Try to get from URL params first
      const urlAmount = parseFloat(initialSearchParams.current.get("amount"));
      const urlBidId = initialSearchParams.current.get("confirmedBidId");

      // Get saved order ID using user-specific key
      const savedOrderId = getUserStorageItem(user.sub, 'order_id');
      if (savedOrderId) {
        setOrderId(savedOrderId);
      }
      
      if (urlAmount && urlBidId) {
        // Save to localStorage with user-specific keys
        setUserStorageItem(user.sub, 'payment_amount', urlAmount);
        setUserStorageItem(user.sub, 'confirmed_bid_id', urlBidId);
        
        setAmount(urlAmount);
        setConfirmedBidId(urlBidId);

        // Fetch the order details to get the orderId
        try {
          const orderDetails = await fetchConfirmedBidById(urlBidId);
          
          // Validate that this bid belongs to the current user
          if (orderDetails && orderDetails.merchantId === user.sub) {
            if (orderDetails.orderId) {
              setOrderId(orderDetails.orderId);
              setUserStorageItem(user.sub, 'order_id', orderDetails.orderId);
            }
          } else {
            console.error("Attempted to access payment that doesn't belong to current user");
            // Clear invalid data
            setAmount(0);
            setConfirmedBidId(null);
            setOrderId("");
            // Show pending payments instead
            setShowPendingPayments(true);
          }
        } catch (error) {
          console.error("Error fetching order details for orderId:", error);
        }
      } else {
        // Try to get from localStorage using user-specific keys
        const savedAmount = getUserStorageItem(user.sub, 'payment_amount');
        const savedBidId = getUserStorageItem(user.sub, 'confirmed_bid_id');
        
        if (savedAmount && savedBidId) {
          setAmount(parseFloat(savedAmount));
          setConfirmedBidId(savedBidId);
          
          try {
            const orderDetails = await fetchConfirmedBidById(savedBidId);
            
            // Security check - verify this payment belongs to current user
            if (orderDetails && orderDetails.merchantId === user.sub) {
              if (orderDetails.amount) {
                setAmount(orderDetails.amount);
              }

              if (orderDetails.orderId) {
                setOrderId(orderDetails.orderId);
              }
            } else {
              console.error("Payment doesn't belong to current user, clearing data");
              // Clear data and show pending payments
              removeUserStorageItem(user.sub, 'payment_amount');
              removeUserStorageItem(user.sub, 'confirmed_bid_id');
              removeUserStorageItem(user.sub, 'order_id');
              setShowPendingPayments(true);
            }
          } catch (error) {
            console.error("Error fetching order details:", error);
          }
        } else {
          // No specific payment found - show pending payments list
          setShowPendingPayments(true);
        }
      }
    };

    loadPaymentData();
  }, [user]);
  
  // Effect to handle payment switching via URL params
  useEffect(() => {
    if (!user?.sub) return; // Only proceed with valid user

    // Check if there's a timestamp parameter (indicates payment switching)
    const timestamp = searchParams.get("t");
    const urlAmount = parseFloat(searchParams.get("amount"));
    const urlBidId = searchParams.get("confirmedBidId");
    
    // If we have a timestamp and valid payment info, it's a payment switch
    if (timestamp && !isNaN(urlAmount) && urlBidId) {
      console.log("Payment switch detected via URL params");
      
      // Reset payment form state
      setPaymentStatus(null);
      
      // Update with new payment info
      setAmount(urlAmount);
      setConfirmedBidId(urlBidId);
      setShowPendingPayments(false);
      
      // Get order ID from localStorage or fetch it
      const savedOrderId = getUserStorageItem(user.sub, 'order_id');
      if (savedOrderId) {
        setOrderId(savedOrderId);
      } else {
        // Fetch order details if needed
        fetchConfirmedBidById(urlBidId)
          .then(orderDetails => {
            // Verify ownership
            if (orderDetails && orderDetails.merchantId === user.sub) {
              if (orderDetails.orderId) {
                setOrderId(orderDetails.orderId);
                setUserStorageItem(user.sub, 'order_id', orderDetails.orderId);
              }
            } else {
              console.error("Attempted to access payment that doesn't belong to current user");
              // Navigate back to pending payments
              setShowPendingPayments(true);
            }
          })
          .catch(error => {
            console.error("Error fetching order details on payment switch:", error);
          });
      }
      
      // Show notification about payment switch
      setShowSwitchNotification(true);
      
      // Hide notification after 5 seconds
      const timer = setTimeout(() => {
        setShowSwitchNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams, user]);

  const handlePayHerePayment = async () => {
    if (!window.payhere) {
      alert("PayHere is not ready yet. Please wait.");
      return;
    }

    setPaymentStatus('processing');

    // Fetch the hash from backend
    let hash = "";
    try {
      const response = await axios.get("http://localhost:5000/api/payments/generate-hash", {
        params: {
          orderId: orderId || "TEST_" + Math.floor(Math.random() * 10000),
          amount: amount.toFixed(2),
          currency: "LKR"
        }
      });
      hash = response.data.hash;
    } catch (error) {
      setPaymentStatus('error');
      alert("Failed to generate payment hash. Please try again.");
      return;
    }

    const payment = {
      sandbox: true,
      merchant_id: process.env.REACT_APP_PAYHERE_MERCHANT_ID || "1215000",
      return_url: "http://localhost:3000/merchant/purchase-history",
      cancel_url: "http://localhost:3000/merchant/payments",
      notify_url: "http://localhost:5000/api/payments/payhere-notify",
      order_id: orderId || "TEST_" + Math.floor(Math.random() * 10000),
      items: "Farm Produce Payment",
      amount: amount.toFixed(2),
      currency: "LKR",
      first_name: user?.given_name || "User",
      last_name: user?.family_name || "Name",
      email: user?.email || "user@example.com",
      phone: "0771234567",
      address: "123 Farm Address",
      city: "Colombo",
      country: "Sri Lanka",
      hash // Use the hash from backend
    };

    window.payhere.onCompleted = function onCompleted(orderId) {
      console.log("Payment completed. OrderID:" + orderId);
      setPaymentStatus('success');
      
      // Update the confirmed bid status
      if (confirmedBidId) {
        try {
          console.log(`Updating payment status for bid: ${confirmedBidId}`);
          
          // Clear user-specific localStorage after successful payment
          removeUserStorageItem(user.sub, 'payment_amount');
          removeUserStorageItem(user.sub, 'confirmed_bid_id');
          removeUserStorageItem(user.sub, 'order_id');
        } catch (error) {
          console.error("Error updating payment status:", error);
        }
      }
      
      // Redirect after successful payment
      setTimeout(() => {
        navigate('/merchant/purchase-history');
      }, 2000);
    };

    window.payhere.onDismissed = function onDismissed() {
      console.log("Payment dismissed");
      setPaymentStatus('dismissed');
    };

    window.payhere.onError = function onError(error) {
      console.log("Error:" + error);
      setPaymentStatus('error');
    };

    window.payhere.startPayment(payment);
  };

  const handleRegularPayment = () => {
    if (!user?.sub) return; // Security check
    
    // Set payment in progress status
    setPaymentStatus('processing');
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus('success');
      
      // Update the confirmed bid status (you can implement this in your orderService)
      if (confirmedBidId) {
        try {
          console.log(`Updating payment status for bid: ${confirmedBidId}`);
          
          // Clear user-specific localStorage after successful payment
          removeUserStorageItem(user.sub, 'payment_amount');
          removeUserStorageItem(user.sub, 'confirmed_bid_id');
          removeUserStorageItem(user.sub, 'order_id');
        } catch (error) {
          console.error("Error updating payment status:", error);
        }
      }
      
      alert(`Payment of Rs.${amount.toFixed(2)} processed successfully!`);
      
      // Wait a moment before redirecting
      setTimeout(() => {
        navigate('/merchant/purchase-history');
      }, 2000);
    }, 1500);
  };

  // Handle toggling between payment form and pending payments
  const togglePendingPayments = () => {
    // If switching to pending payments view, trigger refresh
    if (!showPendingPayments) {
      setTimeout(() => {
        // Dispatch event to refresh pending payments list
        const event = new CustomEvent('refreshPendingPayments');
        window.dispatchEvent(event);
      }, 100);
    }
    
    setShowPendingPayments(!showPendingPayments);
  };

  // Updated render method to conditionally show pending payments
  return (
    <Box sx={{ padding: "20px" }}>
      {/* Button to toggle between payment form and pending payments */}
      <Button 
        variant="outlined"
        color="primary"
        startIcon={showPendingPayments ? null : <AccessTimeIcon />}
        sx={{ mb: 2 }}
        onClick={togglePendingPayments}
      >
        {showPendingPayments ? 'Return to Current Payment' : 'View All Pending Payments'}
      </Button>

      {showPendingPayments ? (
        // Show pending payments component when no specific payment is selected
        <>
          <Typography variant="h5" gutterBottom>Payment Center</Typography>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="body1">
              Select a payment to continue the payment process.
            </Typography>
          </Paper>
          <PendingPayments />
        </>
      ) : (
        // Show the normal payment form when a payment is selected
        <>
          <Typography variant="h5" gutterBottom>Pay Now</Typography>
          
          {/* New notification for payment switching */}
          {showSwitchNotification && (
            <Alert severity="info" sx={{ mb: 2 }} onClose={() => setShowSwitchNotification(false)}>
              Payment switched successfully. Previous payment returned to pending list.
            </Alert>
          )}
          
          {paymentStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Payment successful! Redirecting to your purchase history...
            </Alert>
          )}
          
          {paymentStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Payment failed. Please try again.
            </Alert>
          )}
          
          {paymentStatus === 'dismissed' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Payment was cancelled. You can try again.
            </Alert>
          )}
          
          {paymentStatus === 'processing' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Processing your payment. Please wait...
            </Alert>
          )}

          <Box sx={{ marginBottom: "20px" }}>
            <Typography variant="body1">Farm-to-Market</Typography>
            <Typography variant="h4" fontWeight="bold">Rs.{amount.toFixed(2)}</Typography>
            <Typography variant="body2" color="textSecondary">{orderId ? `Order No:${orderId}` : 'Loading Order ID...'}</Typography>
          </Box>

          

          <Button
            variant="contained"
            startIcon={<PaymentIcon />}
            fullWidth
            sx={{ 
              background: amount && !paymentStatus ? "#FFA500" : 
                         paymentStatus === 'success' ? "#4CAF50" : 
                         paymentStatus === 'processing' ? "#3498DB" : "#E0E0E0", 
              color: "white",
              mb: 2
            }}
            onClick={handleRegularPayment}
            disabled={!amount || paymentStatus === 'processing' || paymentStatus === 'success'}
          >
            {paymentStatus === 'processing' ? 'Processing...' : 
             paymentStatus === 'success' ? 'Payment Successful' : 
             `Pay Rs.${amount.toFixed(2)} (Test)`}
          </Button>

          <Button
            variant="contained"
            startIcon={<PaymentIcon />}
            fullWidth
            sx={{ 
              background: amount && isPayHereLoaded && !paymentStatus ? "#5C6BC0" : 
                         paymentStatus === 'success' ? "#4CAF50" : 
                         paymentStatus === 'processing' ? "#3498DB" : "#E0E0E0", 
              color: "white" 
            }}
            onClick={handlePayHerePayment}
            disabled={!amount || !isPayHereLoaded || paymentStatus === 'processing' || paymentStatus === 'success'}
          >
            {!isPayHereLoaded ? 'Loading PayHere...' : 
             paymentStatus === 'processing' ? 'Processing...' : 
             paymentStatus === 'success' ? 'Payment Successful' : 
             `Pay Rs.${amount.toFixed(2)} with PayHere`}
          </Button>
        </>
      )}
    </Box>
  );
};

export default Payments;