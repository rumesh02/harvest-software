import React, { useState, useEffect } from "react";
import { Typography, Table, TableBody, TableCell, TableContainer, 
         TableHead, TableRow, Paper, Button, Box, Dialog, DialogTitle, 
         DialogContent, DialogActions, TextField, Slider, Alert, 
         Snackbar, Divider, Chip, Grid, LinearProgress, Tooltip,
         CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InfoIcon from "@mui/icons-material/Info";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { useAuth0 } from "@auth0/auth0-react"; // Import Auth0 hook
import { useNavigate } from "react-router-dom"; 
import api from "../../services/api"; // Import the API service with the correct baseURL

// Constants for rebid functionality
const MINIMUM_BID_INCREASE_PERCENT = 5; // Minimum 5% increase from previous bid
const MAXIMUM_REBIDS_PER_PRODUCT = 10;   // Maximum 10 rebids per product
const REBID_COOLDOWN_MINUTES = 0.5;      // 30 seconds cooldown between rebids

const MyBids = () => {
  const { user } = useAuth0(); // Get the current user from Auth0
  const [bids, setBids] = useState({
    accepted: [],
    confirmed: [],
    pending: [],
    rejected: [],
    rebidded: [] // Add rebidded bids tracking
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigation
  
  // Rebid functionality states
  const [rebidDialog, setRebidDialog] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [newBidAmount, setNewBidAmount] = useState(0);
  const [newOrderWeight, setNewOrderWeight] = useState(0);
  const [rebidHistory, setRebidHistory] = useState({});
  const [rebidSnackbar, setRebidSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [marketInsights, setMarketInsights] = useState({
    availableStock: 0,
    currentPrice: 0,
    averageWinningBid: 0,
    suggestedRange: { min: 0, max: 0 },
    seasonalTrend: "stable", // Can be "up", "down", or "stable"
    successRate: 0
  });
  const [rebidLoading, setRebidLoading] = useState(false);

  // Fetch bids from backend
  useEffect(() => {
    const fetchBids = async () => {
      try {
        // Get the authenticated merchant's ID
        const merchantId = user?.sub || localStorage.getItem('user_id');
        if (!merchantId) {
          console.error("No merchant ID found");
          setLoading(false);
          return;
        }
        // Fetch bids from the backend
        const response = await api.get("/bids");
        const allBids = response.data;
        // Filter bids to show only those belonging to the current merchant
        const merchantBids = allBids.filter(bid => bid.merchantId === merchantId);
        // Sort filtered bids by status (exclude "Rebidded" bids from rejected)
        const sortedBids = {
          accepted: merchantBids.filter(bid => bid.status === "Accepted"),
          confirmed: merchantBids.filter(bid => bid.status === "Confirmed"),
          pending: merchantBids.filter(bid => bid.status === "Pending"),
          rejected: merchantBids.filter(bid => bid.status === "Rejected"),
          rebidded: merchantBids.filter(bid => bid.status === "Rebidded")
        };
        // For each rejected bid, fetch the product's current stock and attach it
        const rejectedWithStock = await Promise.all(
          sortedBids.rejected.map(async (bid) => {
            try {
              const productRes = await api.get(`/products/${bid.productId}`);
              const product = productRes.data;
              console.log(`Full product object for ${bid.productName} (ID: ${bid.productId}):`, product);
              // Try common property names for stock
              const stock = product.stock ?? product.quantity ?? product.availableStock ?? undefined;
              return { ...bid, productStock: stock };
            } catch (err) {
              console.error(`Error fetching product stock for productId ${bid.productId}:`, err);
              return { ...bid, productStock: undefined };
            }
          })
        );
        console.log('Rejected bids with stock:', rejectedWithStock);
        setBids({
          ...sortedBids,
          rejected: rejectedWithStock
        });
        // Create congratulatory notification if there are accepted bids
        if (sortedBids.accepted.length > 0) {
          await createAcceptedBidsNotification(sortedBids.accepted, merchantId);
        }
      } catch (error) {
        console.error("Error fetching bids:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.sub || localStorage.getItem('user_id')) {
      fetchBids();
      // Refresh every 30 seconds
      const interval = setInterval(fetchBids, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleConfirmOrder = async (bid) => {
    try {
      console.log('Starting confirmation process with bid:', bid);
      
      // Update the bid status to "Confirmed" in the backend
      console.log(`Updating bid status for bid ID: ${bid._id}`);
      const statusUpdateResponse = await api.put(`/bids/status/${bid._id}`, {
        status: "Confirmed"
      });
      console.log('Status update response:', statusUpdateResponse.data);

      // Fetch the product details to get location information and item code
      let productLocation = null;
      let itemCode = null;
      
      console.log(`Attempting to fetch product with ID: ${bid.productId}`);
      
      try {
        const productResponse = await axios.get(`http://localhost:5000/api/products/${bid.productId}`);
        productLocation = productResponse.data.location;
        itemCode = productResponse.data.itemCode || productResponse.data.productID;
        console.log('Product location fetched successfully:', productLocation);
        console.log('Item code fetched successfully:', itemCode);
      } catch (error) {
        console.error('Error fetching product details:', error);
        console.log(`Product ID not found: ${bid.productId}, trying farmer location...`);
        
        // If product is not found, try to get location from farmer information
        try {
          const farmerResponse = await axios.get(`http://localhost:5000/api/users/${bid.farmerId}`);
          if (farmerResponse.data.location) {
            productLocation = {
              address: farmerResponse.data.location.address || `Farmer location: ${farmerResponse.data.location}`,
              coordinates: farmerResponse.data.location.coordinates || null
            };
            console.log('Using farmer location as fallback:', productLocation);
          }
        } catch (farmerError) {
          console.error('Error fetching farmer location:', farmerError);
        }
        
        // Generate item code from bid information if product not found
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const timeStamp = now.getTime().toString().slice(-4);
        itemCode = `HVT-${year}-${month}-${day}-${timeStamp}`;
      }
      
      // Ensure we always have location data
      if (!productLocation) {
        productLocation = {
          address: `${bid.productName} harvest location (Details not available)`,
          coordinates: null
        };
        console.log('Using fallback location:', productLocation);
      }
      
      // Ensure we always have an item code
      if (!itemCode) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const timeStamp = now.getTime().toString().slice(-4);
        itemCode = `HVT-${year}-${month}-${day}-${timeStamp}`;
      }
      
      console.log('Final location data:', productLocation);
      console.log('Final item code:', itemCode);
      
      // Create a new confirmed bid record
      console.log('Creating confirmed bid from bid:', bid);
      console.log('Bid orderWeight:', bid.orderWeight, 'Type:', typeof bid.orderWeight);
      console.log('Bid bidAmount:', bid.bidAmount, 'Type:', typeof bid.bidAmount);
      
      const confirmedBidData = {
        orderId: `ORD-${Date.now().toString().slice(-6)}`,
        merchantId: user?.sub,
        farmerId: bid.farmerId,
        amount: bid.bidAmount * bid.orderWeight,
        productLocation: productLocation, // Store the location information
        itemCode: itemCode, // Store the item code
        items: [{
          productId: bid.productId,
          name: bid.productName,
          quantity: bid.orderWeight,
          price: bid.bidAmount,
          itemCode: itemCode // Also store in items array
        }],
        bidId: bid._id // Reference to original bid
      };
      
      console.log('Confirmed bid data being sent:', confirmedBidData);
      console.log('Item quantity being sent:', confirmedBidData.items[0].quantity);
      console.log('Creating confirmed bid with location data:', {
        orderId: confirmedBidData.orderId,
        productLocation: confirmedBidData.productLocation,
        itemCode: confirmedBidData.itemCode
      });
      
      console.log('Sending confirmed bid data to backend:', confirmedBidData);
      const response = await api.post('/confirmedbids', confirmedBidData);
      console.log('Confirmed bid creation response:', response.data);
      console.log('Confirmed bid created successfully:', response.data._id);
      
      // Also create a collection entry for the new collection system
      try {
        await axios.post('http://localhost:5000/api/collections', {
          confirmedBidId: response.data._id
        });
        console.log('Collection created successfully from confirmed bid');
      } catch (collectionError) {
        console.error('Error creating collection:', collectionError);
        // Don't fail the entire process if collection creation fails
      }
      
      // Redirect to the Payments page with the ID and amount
      const finalPrice = bid.bidAmount * bid.orderWeight;
      console.log(`Navigating to payments with amount: ${finalPrice} and confirmedBidId: ${response.data._id}`);
      
      // Don't delete existing payment info, just add the new one to localStorage
      localStorage.setItem('payment_amount', finalPrice);
      localStorage.setItem('confirmed_bid_id', response.data._id);

      // After successful confirmation, update UI state
      setBids(prev => ({
        ...prev,
        accepted: prev.accepted.filter(b => b._id !== bid._id),
        confirmed: [...prev.confirmed, { ...bid, status: "Confirmed" }]
      }));

      navigate(`/merchant/payments?amount=${finalPrice}&confirmedBidId=${response.data._id}`);
    } catch (error) {
      console.error("Error confirming order:", error);
      // Add more detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }
    }
  };

// Fix for the submitRebid function
const submitRebid = async () => {
  if (!selectedBid) return;

  try {
    setRebidLoading(true);

    // Prepare the rebid data
    const rebidData = {
      productId: selectedBid.productId,
      productName: selectedBid.productName,
      bidAmount: newBidAmount,
      orderWeight: newOrderWeight,
      merchantId: user?.sub || localStorage.getItem('user_id'),
      merchantName: selectedBid.merchantName,
      merchantPhone: selectedBid.merchantPhone,
      farmerId: selectedBid.farmerId,
      rebidCount: (rebidHistory.length || 0) + 1,
      previousBidId: selectedBid._id,
      status: "Pending" // Ensure we set the status explicitly
    };

    console.log("Submitting rebid with data:", rebidData);

    // Submit the new bid
    const response = await api.post("/bids", rebidData);
    
    // Handle different response structures from the backend
    let newBid;
    if (response.data.bid) {
      // If the response has a 'bid' property
      newBid = response.data.bid;
    } else if (response.data._id) {
      // If the response is the bid object directly
      newBid = response.data;
    } else {
      // Fallback - use the entire response data
      newBid = response.data;
    }
    
    console.log("New bid created successfully:", newBid);

    // Mark the old rejected bid as "Rebidded" instead of deleting it
    try {
      await api.put(`/bids/status/${selectedBid._id}`, {
        status: "Rebidded"
      });
      console.log(`Successfully marked old bid as Rebidded with ID: ${selectedBid._id}`);
    } catch (statusError) {
      console.error("Error updating old bid status:", statusError);
      // Continue with the process even if status update fails
    }

    // Update local state - add new bid to pending and remove old bid from rejected
    setBids((prev) => ({
      ...prev,
      pending: [...prev.pending, newBid],
      rejected: prev.rejected.filter((bid) => bid._id !== selectedBid._id)
    }));

    console.log("Local state updated - old rejected bid removed, new bid added to pending");

    // Close the dialog and show success message
    setRebidDialog(false);
    setRebidSnackbar({
      open: true,
      message: "Rebid successfully submitted!",
      severity: "success"
    });
  } catch (error) {
    console.error("Error submitting rebid:", error);
    
    // Improved error handling with more specific messages
    let errorMessage = "Failed to submit rebid. Please try again.";
    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = "The bid endpoint was not found. Please contact support.";
      } else if (error.response.data && error.response.data.message) {
        errorMessage = `Error: ${error.response.data.message}`;
      } else {
        errorMessage = `Server error (${error.response.status}). Please try again later.`;
      }
    } else if (error.request) {
      errorMessage = "No response from server. Please check your internet connection.";
    }
    
    setRebidSnackbar({
      open: true,
      message: errorMessage,
      severity: "error"
    });
  } finally {
    setRebidLoading(false);
  }
};

  // Create congratulatory notification for accepted bids
  const createAcceptedBidsNotification = async (acceptedBids, merchantId) => {
    try {
      // Check if notification already exists to avoid duplicates
      const existingNotifications = await api.get(`/notifications/${merchantId}`);
      const hasRecentAcceptedNotification = existingNotifications.data.some(notification => 
        notification.type === 'bid_accepted' && 
        new Date(notification.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      );

      if (hasRecentAcceptedNotification) {
        console.log('Recent accepted bids notification already exists, skipping creation');
        return;
      }

      const congratulatoryNotification = {
        userId: merchantId,
        title: '🎉 Congratulations! Your bids have been accepted!',
        message: `You have ${acceptedBids.length} accepted bid${acceptedBids.length > 1 ? 's' : ''}. Check your notification bell (🔔) in the top navigation for detailed alerts.`,
        type: 'bid_accepted',
        metadata: {
          acceptedBidsCount: acceptedBids.length,
          bidIds: acceptedBids.map(bid => bid._id),
          totalValue: acceptedBids.reduce((sum, bid) => sum + (bid.bidAmount * bid.orderWeight), 0)
        }
      };

      console.log('Creating congratulatory notification:', congratulatoryNotification);
      const response = await api.post('/notifications', congratulatoryNotification);
      console.log('Congratulatory notification created successfully:', response.data);
    } catch (error) {
      console.error('Error creating congratulatory notification:', error);
    }
  };

  // Test function to create a notification manually
  const testNotification = async () => {
    try {
      const merchantId = user?.sub || localStorage.getItem('user_id');
      console.log('Creating test notification for merchant:', merchantId);
      
      const testNotificationData = {
        userId: merchantId,
        title: '🎉 Test Notification!',
        message: 'This is a test notification to check if the system is working.',
        type: 'general',
        metadata: {
          productName: 'Test Product',
          amount: 1000
        }
      };

      const response = await api.post('/notifications', testNotificationData);
      console.log('Test notification created:', response.data);
    } catch (error) {
      console.error('Error creating test notification:', error);
    }
  };

  // Get market insights for a product
  const fetchMarketInsights = async (productId, prevBidAmount) => {
    try {
      // In a real-world scenario, you'd have an API endpoint for this
      // For now, we'll simulate market insights based on previous bid amount
      
      // Get the product details
      const productResponse = await api.get(`/products/${productId}`);
      const product = productResponse.data;
      
      // Get the current stock and price
      const availableStock = product.quantity || product.stock || product.availableStock || 0;
      const currentPrice = product.price;
      
      // Debug logs to ensure we're getting stock information
      console.log("Product fetched:", product);
      console.log("Available stock detected:", availableStock);
      console.log("Current price:", currentPrice);
      
      // Simulate market analysis
      const basePrice = Number(product.price);
      const previousBid = Number(prevBidAmount);
      
      // Calculate average winning bid (simulated)
      const averageWinningBid = basePrice * 1.15; // 15% above base price
      
      // Suggested bid range
      const suggestedMin = Math.max(previousBid * (1 + MINIMUM_BID_INCREASE_PERCENT/100), basePrice * 1.10);
      const suggestedMax = basePrice * 1.25; // 25% above base price for max
      
      // Determine success rate based on how far previous bid was from average winning bid
      const bidPercentOfAverage = (previousBid / averageWinningBid) * 100;
      let successRate;
      
      if (bidPercentOfAverage >= 100) {
        successRate = 75; // If previous bid was already at or above average winning bid
      } else if (bidPercentOfAverage >= 90) {
        successRate = 60; // If previous bid was close (90%+) to average winning bid
      } else if (bidPercentOfAverage >= 80) {
        successRate = 30; // If previous bid was somewhat close (80%+)
      } else {
        successRate = 10; // If previous bid was far below average winning bid
      }
      
      // Determine seasonal trend (simulated)
      const month = new Date().getMonth();
      let seasonalTrend;
      
      // Simulate seasonal trends
      if ([3, 4, 5].includes(month)) { // Spring months (price trending up)
        seasonalTrend = "up";
      } else if ([9, 10, 11].includes(month)) { // Fall months (price trending down)
        seasonalTrend = "down";
      } else {
        seasonalTrend = "stable"; // Other months
      }
      
      return {
        availableStock,
        currentPrice,
        averageWinningBid,
        suggestedRange: { min: suggestedMin, max: suggestedMax },
        seasonalTrend,
        successRate
      };
    } catch (error) {
      console.error("Error fetching market insights:", error);
      return {
        availableStock: 0,
        currentPrice: 0,
        averageWinningBid: 0,
        suggestedRange: { min: 0, max: 0 },
        seasonalTrend: "stable",
        successRate: 0
      };
    }
  };

  // Check rebid count and cooldown period
  const checkRebidLimits = async (productId, merchantId) => {
    try {
      // Get all bids by this merchant for this product
      const response = await api.get("/bids"); // Changed from axios to api service
      const allBids = response.data;
      
      // Filter bids to only this merchant and this product
      const merchantProductBids = allBids.filter(bid => 
        bid.merchantId === merchantId && 
        bid.productId === productId
      );
      
      // Get the count of previous rebids
      const rebidCount = merchantProductBids.length;
      
      // Check if we've hit the maximum rebid count
      if (rebidCount >= MAXIMUM_REBIDS_PER_PRODUCT) {
        return {
          canRebid: false,
          reason: `Maximum rebid limit (${MAXIMUM_REBIDS_PER_PRODUCT}) reached for this product.`,
          rebidCount
        };
      }
      
      // Get the most recent bid
      const sortedBids = merchantProductBids.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      // If there's at least one bid, check the cooldown period
      if (sortedBids.length > 0) {
        const lastBidTime = new Date(sortedBids[0].createdAt);
        const currentTime = new Date();
        const minutesSinceLastBid = (currentTime - lastBidTime) / (1000 * 60);
        
        if (minutesSinceLastBid < REBID_COOLDOWN_MINUTES) {
          const timeToWait = Math.ceil(REBID_COOLDOWN_MINUTES - minutesSinceLastBid);
          return {
            canRebid: false,
            reason: `Please wait ${timeToWait} more minute${timeToWait !== 1 ? 's' : ''} before placing another bid.`,
            rebidCount,
            timeToWait
          };
        }
      }
      
      // All checks passed, can rebid
      return {
        canRebid: true,
        rebidCount,
        previousBids: merchantProductBids
      };
    } catch (error) {
      console.error("Error checking rebid limits:", error);
      return {
        canRebid: false,
        reason: "An error occurred while checking rebid limits.",
        error: error.message
      };
    }
  };

  // Handle ReBid button click
  const handleRebidClick = async (bid) => {
    try {
      setRebidLoading(true);
      const merchantId = user?.sub || localStorage.getItem('user_id');
      
      // Check rebid limits
      const rebidLimitCheck = await checkRebidLimits(bid.productId, merchantId);
      
      if (!rebidLimitCheck.canRebid) {
        setRebidSnackbar({
          open: true,
          message: rebidLimitCheck.reason,
          severity: "warning"
        });
        setRebidLoading(false);
        return;
      }
      
      // Fetch market insights for intelligent suggestions
      const insights = await fetchMarketInsights(bid.productId, bid.bidAmount);
      setMarketInsights(insights);
      
      // Set initial values for the rebid form - suggest a higher amount but don't enforce it
      const suggestedBidAmount = Math.ceil(Number(bid.bidAmount) * (1 + MINIMUM_BID_INCREASE_PERCENT/100));
      // Start with a suggested amount that is slightly higher than previous bid
      setNewBidAmount(suggestedBidAmount);
      
      // Set order weight to either previous weight or maximum available stock, whichever is smaller
      const orderWeight = Math.min(Number(bid.orderWeight), insights.availableStock);
      setNewOrderWeight(orderWeight);
      
      console.log("Available stock:", insights.availableStock);
      console.log("Setting order weight to:", orderWeight);
      
      // Set the selected bid and open the dialog
      setSelectedBid(bid);
      setRebidHistory(rebidLimitCheck.previousBids || []);
      setRebidDialog(true);
      setRebidLoading(false);
    } catch (error) {
      console.error("Error preparing rebid:", error);
      setRebidSnackbar({
        open: true,
        message: "Failed to prepare rebid form. Please try again.",
        severity: "error"
      });
      setRebidLoading(false);
    }
  };

  if (loading) {
    return <Typography variant="body1">Loading your bids...</Typography>;
  }

  const hasNoBids = 
    bids.accepted.length === 0 && 
    bids.pending.length === 0 && 
    bids.rejected.length === 0 &&
    bids.rebidded.length === 0;

  if (hasNoBids) {
    return (
      <Box sx={{ padding: "20px" }}>
        <Typography variant="h5" gutterBottom>My Bids</Typography>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1">
            You haven't placed any bids yet. Browse products and place your first bid!
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: "20px" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" gutterBottom>My Bids</Typography>
        
        <Box>
          {/* Test Notification Button - Remove this after testing */}
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={testNotification}
            sx={{ mr: 1 }}
          >
            Test Notification
          </Button>
          
          {/* Create Congratulatory Notification Button */}
          {bids.accepted.length > 0 && (
            <Button 
              variant="contained" 
              color="success" 
              onClick={() => createAcceptedBidsNotification(bids.accepted, user?.sub || localStorage.getItem('user_id'))}
            >
              Create Success Notification
            </Button>
          )}
        </Box>
      </Box>

      {/* Accepted Bids */}
      <Typography variant="h6" sx={{ display: "flex", alignItems: "center", color: "green", mb: 1 }}>
        <CheckCircleIcon sx={{ mr: 1 }} /> Accepted Bids (Won) 
        {bids.accepted.length > 0 && (
          <Typography variant="body2" sx={{ ml: 1, color: "#4CAF50", fontWeight: 500 }}>
            - Check your notifications for acceptance alerts! 🔔
          </Typography>
        )}
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>No.</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Winning Bid</TableCell>
              <TableCell>Final Price</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bids.accepted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No accepted bids yet</TableCell>
              </TableRow>
            ) : (
              bids.accepted.map((bid, index) => (
                <TableRow key={bid._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{bid.productName}</TableCell>
                  <TableCell>
                    Rs. {bid.bidAmount} (per Kg)<br />
                    {bid.orderWeight} Kg
                  </TableCell>
                  <TableCell>Rs. {bid.bidAmount * bid.orderWeight}</TableCell>
                  <TableCell>
                    {bid.status === "Confirmed" ? (
                      <Button 
                        variant="contained" 
                        color="success" 
                        disabled
                      >
                        Confirmed
                      </Button>
                    ) : (
                      <Button 
                        variant="contained" 
                        color="warning"
                        onClick={() => handleConfirmOrder(bid)}
                      >
                        Confirm Order
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pending Bids */}
      <Typography variant="h6" sx={{ display: "flex", alignItems: "center", color: "#FF9800", mb: 1 }}>
        <HourglassEmptyIcon sx={{ mr: 1 }} /> Pending Bids (Awaiting Approval)
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>No.</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Bid</TableCell>
              <TableCell>Final Price</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bids.pending.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No pending bids</TableCell>
              </TableRow>
            ) : (
              bids.pending.map((bid, index) => (
                <TableRow key={bid._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{bid.productName}</TableCell>
                  <TableCell>
                    Rs. {bid.bidAmount} (per Kg)<br />
                    {bid.orderWeight} Kg
                  </TableCell>
                  <TableCell>Rs. {bid.bidAmount * bid.orderWeight}</TableCell>
                  <TableCell>
                    <Typography color="info.main">Pending Approval</Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmed Bids */}
      <Typography variant="h6" sx={{ display: "flex", alignItems: "center", color: "#003153", mb: 1 }}>
        <CheckCircleIcon sx={{ mr: 1, color: '#003153' }} /> Confirmed Bids (finalized orders)
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>No.</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Winning Bid</TableCell>
              <TableCell>Final Price</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bids.confirmed.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No confirmed bids yet</TableCell>
              </TableRow>
            ) : (
              bids.confirmed.map((bid, index) => (
                <TableRow key={bid._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{bid.productName}</TableCell>
                  <TableCell>
                    Rs. {bid.bidAmount} (per Kg)<br />
                    {bid.orderWeight} Kg
                  </TableCell>
                  <TableCell>Rs. {bid.bidAmount * bid.orderWeight}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="success" disabled>
                      Confirmed
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Rejected Bids */}
      <Typography variant="h6" sx={{ display: "flex", alignItems: "center", color: "red", mb: 1 }}>
        <CancelIcon sx={{ mr: 1 }} /> Rejected Bids (Lost)
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>No.</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Your Bid</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bids.rejected.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No rejected bids</TableCell>
              </TableRow>
            ) : (
              bids.rejected.map((bid, index) => {
                // Assume bid.productStock is available and 0 means out of stock
                const isOutOfStock = bid.productStock !== undefined && Number(bid.productStock) === 0;
                const isInStock = bid.productStock !== undefined && Number(bid.productStock) > 0;
                return (
                  <TableRow key={bid._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{bid.productName}</TableCell>
                    <TableCell>
                      Rs. {bid.bidAmount} (per Kg)<br />
                      {bid.orderWeight} Kg
                      <br />
                      <Typography variant="caption" color={isOutOfStock ? "error" : isInStock ? "success.main" : "info.main"}>
                        {bid.productStock === undefined ? 'Stock: N/A' : (isOutOfStock ? 'Out of Stock' : 'In Stock')}
                        {bid.productStock !== undefined && ` (${bid.productStock})`}
                      </Typography>
                    </TableCell>
                    <TableCell>Rejected</TableCell>
                    <TableCell>
                      {isOutOfStock ? (
                        <Box>
                          <Typography variant="caption" color="error" sx={{ display: "block", mb: 1 }}>
                            Out of Stock
                          </Typography>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => {
                              api.delete(`/bids/${bid._id}`)
                                .then(() => {
                                  setBids(prev => ({
                                    ...prev,
                                    rejected: prev.rejected.filter(b => b._id !== bid._id)
                                  }));
                                })
                                .catch(err => {
                                  console.error("Error removing bid:", err);
                                });
                            }}
                          >
                            Remove
                          </Button>
                        </Box>
                      ) : (
                        <Tooltip 
                          title={`Place a new improved bid for ${bid.productName}`} 
                          arrow
                        >
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleRebidClick(bid)}
                            disabled={rebidLoading && selectedBid?._id === bid._id}
                            startIcon={rebidLoading && selectedBid?._id === bid._id ? null : <TrendingUpIcon />}
                            sx={{ minWidth: 100 }}
                          >
                            {rebidLoading && selectedBid?._id === bid._id ? (
                              <>
                                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                Loading...
                              </>
                            ) : "ReBid"}
                          </Button>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Rebid Dialog */}
      <Dialog 
        open={rebidDialog} 
        onClose={() => setRebidDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white' }}>
          Smart Rebid for {selectedBid?.productName}
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 2 }}>
          {selectedBid && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.paper', borderLeft: '4px solid #4CAF50', height: 'fit-content' }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>Previous Bid</Typography>
                    <Typography variant="body1">Price: Rs. {selectedBid.bidAmount} per kg</Typography>
                    <Typography variant="body1">Quantity: {selectedBid.orderWeight} kg</Typography>
                    <Typography variant="body1">Total: Rs. {selectedBid.bidAmount * selectedBid.orderWeight}</Typography>
                    <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                      This bid was rejected by the farmer.
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 1.5, bgcolor: '#f9f9f9', borderLeft: '4px solid #2196F3', height: 'fit-content' }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>Market Insights</Typography>
                    
                    {/* Current Product Information */}
                    <Box sx={{ 
                      mb: 1.5, 
                      p: 1.5, 
                      borderRadius: 1, 
                      border: marketInsights.availableStock < 50 ? '1px solid #f44336' : '1px dashed #2196F3',
                      bgcolor: marketInsights.availableStock < 50 ? 'rgba(244, 67, 54, 0.05)' : 'rgba(33, 150, 243, 0.05)'
                    }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ 
                        color: marketInsights.availableStock < 50 ? '#f44336' : '#1976d2', 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        Current Product Status
                        {marketInsights.availableStock < 50 && (
                          <Chip 
                            label="Limited Stock" 
                            size="small" 
                            color="error" 
                            variant="outlined" 
                            sx={{ ml: 1, height: 20 }} 
                          />
                        )}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            Available Stock:
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            color: marketInsights.availableStock > 50 ? 'success.main' : 
                                  marketInsights.availableStock > 0 ? 'warning.main' : 'error.main',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center' 
                          }}>
                            {marketInsights.availableStock} kg
                            {marketInsights.availableStock < 20 && marketInsights.availableStock > 0 && (
                              <Typography variant="caption" color="error.main" sx={{ ml: 1 }}>
                                (Low stock!)
                              </Typography>
                            )}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            Current Price:
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                            Rs. {marketInsights.currentPrice} per kg
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <LightbulbIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
                      Average Winning Bid: <strong>Rs. {Math.ceil(marketInsights.averageWinningBid)} per kg</strong>
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Success Chance:
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={marketInsights.successRate} 
                        sx={{ 
                          mt: 1, 
                          height: 10, 
                          borderRadius: 5,
                          bgcolor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: marketInsights.successRate > 70 ? '#4CAF50' : 
                                    marketInsights.successRate > 40 ? '#FF9800' : '#f44336'
                          }
                        }} 
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {marketInsights.successRate}% chance of acceptance
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2">
                      <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5, color: 'info.main' }} />
                      Suggested bid range: 
                      <Box component="span" sx={{ display: 'block', mt: 0.5, ml: 2 }}>
                        <strong>Rs. {Math.ceil(marketInsights.suggestedRange.min)} - {Math.ceil(marketInsights.suggestedRange.max)}</strong> per kg (optional)
                      </Box>
                    </Typography>
                    
                    {marketInsights.seasonalTrend !== "stable" && (
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                        <TrendingUpIcon 
                          sx={{ 
                            mr: 1, 
                            color: marketInsights.seasonalTrend === "up" ? 'success.main' : 'error.main',
                            transform: marketInsights.seasonalTrend === "down" ? 'rotate(180deg)' : 'none'
                          }} 
                        />
                        <Typography variant="body2">
                          Seasonal trend: Prices are 
                          <strong> {marketInsights.seasonalTrend === "up" ? "increasing" : "decreasing"}</strong>
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }}>
                <Chip label="Your New Bid" color="primary" />
              </Divider>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>New Bid Amount (per kg)</Typography>
                  <TextField
                    label="Bid Amount (Rs.)"
                    type="number"
                    fullWidth
                    variant="outlined"  
                    value={newBidAmount}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      // No minimum increase percentage requirement, just make sure it's a valid number
                      if (!isNaN(value)) {
                        setNewBidAmount(value);
                      }
                    }}
                    InputProps={{
                      startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>Rs.</Typography>,
                    }}
                      InputLabelProps={{
    sx: { 
      marginTop: 0, // Remove top margin from label
      '&.MuiInputLabel-shrink': {
        marginTop: 0 // Ensure the margin remains 0 when the label shrinks
      }
    }
  }}
                    helperText={
                      newBidAmount <= selectedBid?.bidAmount ?
                      `Must be higher than your previous bid of Rs. ${selectedBid?.bidAmount}` :
                      newBidAmount < marketInsights.suggestedRange.min ? 
                      `Suggested minimum: Rs. ${Math.ceil(marketInsights.suggestedRange.min)} (optional)` : 
                      newBidAmount > marketInsights.suggestedRange.max ?
                      "Your bid is higher than suggested (but that's okay!)" : 
                      "Within suggested range (good chances of acceptance)"
                    }
                    FormHelperTextProps={{
                      sx: { 
                        color: newBidAmount <= selectedBid?.bidAmount ? 'error.main' :
                              'text.secondary' // Always use neutral color for suggestions
                      }
                    }}
                  />
                  
                  <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                    Adjust bid amount:
                  </Typography>
                  <Slider
                    value={newBidAmount}
                    onChange={(_, value) => setNewBidAmount(Number(value))}
                    min={Math.ceil(selectedBid.bidAmount + 1)} // Just above previous bid
                    max={Math.ceil(marketInsights.suggestedRange.max * 1.5)} // Higher maximum to allow more freedom
                    step={5}
                    marks={[
                      {
                        value: Math.ceil(selectedBid.bidAmount + 1),
                        label: 'Min'
                      },
                                         
                      {
                        value: Math.ceil(marketInsights.suggestedRange.max),
                        label: 'High'
                      }
                    ]}
                    valueLabelDisplay="auto"
                    sx={{
                      mx: 2,
                      width: 'calc(100% - 32px)',
                      color: 'primary.main', // Always use primary color regardless of bid amount
                      '& .MuiSlider-markLabel': {
                        fontSize: '0.75rem',  // Smaller font size for mark labels
                        fontWeight: 500,      // Make text bolder
                        transform: 'translateX(-50%)',  // Center the labels
                        whiteSpace: 'nowrap',  // Prevent text wrapping
                        mt: 0  // Add margin top for better spacing
                      },
                      '& .MuiSlider-mark': {
                        height: 8  // Taller marks for better visibility
                      },
                      '& .MuiSlider-rail': {
                        height: 6  // Thicker rail for better visibility
                      },
                      '& .MuiSlider-track': {
                        height: 6  // Match rail thickness
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Order Weight (kg)</Typography>
                  <TextField
                    label="Order Weight (kg)"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={newOrderWeight}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      // Don't allow values greater than available stock
                      if (value <= marketInsights.availableStock) {
                        setNewOrderWeight(value);
                      } else {
                        setNewOrderWeight(marketInsights.availableStock);
                        // Show warning for exceeding available stock
                        setRebidSnackbar({
                          open: true,
                          message: `Order quantity limited to available stock: ${marketInsights.availableStock} kg`,
                          severity: "warning"
                        });
                      }
                    }}
                    InputProps={{
                      endAdornment: <Typography variant="body2" sx={{ ml: 1 }}>kg</Typography>,
                    }}
                    inputProps={{ 
                      min: 1, 
                      max: marketInsights.availableStock 
                    }}
                     InputLabelProps={{
    sx: { 
      marginTop: 0, // Remove top margin from label
      '&.MuiInputLabel-shrink': {
        marginTop: 0 // Ensure the margin remains 0 when the label shrinks
      }
    }
  }}
                    helperText={
                      newOrderWeight > marketInsights.availableStock ? 
                      `Cannot exceed available stock (${marketInsights.availableStock} kg)` : 
                      `Maximum available: ${marketInsights.availableStock} kg`
                    }
                    FormHelperTextProps={{
                      sx: { 
                        color: newOrderWeight > marketInsights.availableStock ? 'error.main' : 'text.secondary'
                      }
                    }}
                    error={newOrderWeight > marketInsights.availableStock}
                  />
                  
                  <Paper sx={{ p: 2, mt: 2, bgcolor: '#f8f9fa' }}>
                    <Typography variant="subtitle1" gutterBottom>Order Summary</Typography>
                    <Typography variant="body2">Price per kg: Rs. {newBidAmount}</Typography>
                    <Typography variant="body2">Quantity: {newOrderWeight} kg</Typography>
                    <Typography variant="h6" sx={{ mt: 1, color: 'success.main' }}>
                      Total: Rs. {newBidAmount * newOrderWeight}
                    </Typography>
                    
                    {/* Show price difference from previous bid */}
                    {selectedBid && (
                      <Box sx={{ mt: 2, pt: 1, borderTop: '1px dashed #ddd' }}>
                        <Typography variant="body2">
                          {newBidAmount > selectedBid.bidAmount ? (
                            <span>
                              Price increase: <strong style={{ color: '#4CAF50' }}>
                                +Rs. {(newBidAmount - selectedBid.bidAmount)} per kg 
                                ({((newBidAmount - selectedBid.bidAmount) / selectedBid.bidAmount * 100).toFixed(1)}%)
                              </strong>
                            </span>
                          ) : (
                            <span style={{ color: '#f44336' }}>
                              Error: New bid must be higher than previous bid
                            </span>
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
              
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Bidding Tip:</strong> Farmers in this region often accept bids that are 
                  15-20% higher than their asking price. Your current bid is{' '}
                  {((newBidAmount / marketInsights.averageWinningBid) * 100).toFixed(0)}% of the average winning bid amount.
                  These are suggestions only - you are free to bid any amount higher than your previous bid.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Price Comparison:</strong> The farmer's current listed price is Rs. {marketInsights.currentPrice} per kg. 
                  Your bid of Rs. {newBidAmount} is {((newBidAmount / marketInsights.currentPrice) * 100 - 100).toFixed(1)}% 
                  {newBidAmount > marketInsights.currentPrice ? " above " : " below "} 
                  the listed price.
                </Typography>
                {marketInsights.availableStock < selectedBid.orderWeight && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'error.main', fontWeight: 500 }}>
                    <strong>Stock Alert:</strong> Available stock ({marketInsights.availableStock} kg) is less than your previous order ({selectedBid.orderWeight} kg).
                    Your order quantity has been automatically adjusted.
                  </Typography>
                )}
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5', gap: 2 }}>
          <Button 
            onClick={() => setRebidDialog(false)} 
            color="inherit"
            disabled={rebidLoading}
            sx={{ minWidth: 100 }} // Set minimum width to prevent text overlap
          >
            Cancel
          </Button>
          <Button 
            onClick={submitRebid} 
            variant="contained" 
            color="secondary"
            disabled={
              rebidLoading || 
              newBidAmount <= selectedBid?.bidAmount || 
              newOrderWeight <= 0 ||
              newOrderWeight > marketInsights.availableStock
            }
            sx={{ minWidth: 120 }} // Set minimum width to prevent text overlap
            title={
              newOrderWeight > marketInsights.availableStock 
                ? `Order exceeds available stock of ${marketInsights.availableStock} kg` 
                : newBidAmount <= selectedBid?.bidAmount
                ? "New bid must be higher than previous bid"
                : ""
            }
          >
            {rebidLoading ? "Submitting..." : "Submit Rebid"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={rebidSnackbar.open}
        autoHideDuration={6000}
        onClose={() => setRebidSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setRebidSnackbar(prev => ({ ...prev, open: false }))} 
          severity={rebidSnackbar.severity}
          sx={{ width: '100%' }}
        >
          {rebidSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyBids;