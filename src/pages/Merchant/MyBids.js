import React, { useState, useEffect } from "react";
import { Typography, Table, TableBody, TableCell, TableContainer, 
         TableHead, TableRow, Paper, Button, Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react"; // Import Auth0 hook
import { useNavigate } from "react-router-dom"; 

const MyBids = () => {
  const { user } = useAuth0(); // Get the current user from Auth0
  const [bids, setBids] = useState({
    accepted: [],
    confirmed: [],
    pending: [],
    rejected: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigation

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
        
        console.log('Fetching bids for merchant:', merchantId);
        
        // Fetch bids from the backend
        const response = await axios.get("http://localhost:5000/api/bids");
        const allBids = response.data;
        
        console.log('All bids received:', allBids.length);
        
        // Filter bids to show only those belonging to the current merchant
        const merchantBids = allBids.filter(bid => bid.merchantId === merchantId);
        
        console.log('Merchant bids:', merchantBids.length);
        
        // Sort filtered bids by status
        const sortedBids = {
          accepted: merchantBids.filter(bid => bid.status === "Accepted"),
          confirmed: merchantBids.filter(bid => bid.status === "Confirmed"),
          pending: merchantBids.filter(bid => bid.status === "Pending"),
          rejected: merchantBids.filter(bid => bid.status === "Rejected")
        };

        console.log('Sorted bids:', {
          accepted: sortedBids.accepted.length,
          confirmed: sortedBids.confirmed.length,
          pending: sortedBids.pending.length,
          rejected: sortedBids.rejected.length
        });

        setBids(sortedBids);
        
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
      const statusUpdateResponse = await axios.put(`http://localhost:5000/api/bids/status/${bid._id}`, {
        status: "Confirmed"
      });
      console.log('Status update response:', statusUpdateResponse.data);      // Create a new confirmed bid record
      console.log('Creating confirmed bid from bid:', bid);
      console.log('Bid orderWeight:', bid.orderWeight, 'Type:', typeof bid.orderWeight);
      console.log('Bid bidAmount:', bid.bidAmount, 'Type:', typeof bid.bidAmount);
      
      const confirmedBidData = {
        orderId: `ORD-${Date.now().toString().slice(-6)}`,
        merchantId: user?.sub,
        farmerId: bid.farmerId,
        amount: bid.bidAmount * bid.orderWeight,
        items: [{
          productId: bid.productId,
          name: bid.productName,
          quantity: bid.orderWeight,
          price: bid.bidAmount
        }],
        bidId: bid._id // Reference to original bid
      };
      
      console.log('Confirmed bid data being sent:', confirmedBidData);
      console.log('Item quantity being sent:', confirmedBidData.items[0].quantity);
      
      console.log('Sending confirmed bid data to backend:', confirmedBidData);
      const response = await axios.post('http://localhost:5000/api/confirmedbids', confirmedBidData);
      console.log('Confirmed bid creation response:', response.data);
      
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

  // Create congratulatory notification for accepted bids
  const createAcceptedBidsNotification = async (acceptedBids, merchantId) => {
    try {
      // Check if notification already exists to avoid duplicates
      const existingNotifications = await axios.get(`http://localhost:5000/api/notifications/${merchantId}`);
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
      const response = await axios.post('http://localhost:5000/api/notifications', congratulatoryNotification);
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

      const response = await axios.post('http://localhost:5000/api/notifications', testNotificationData);
      console.log('Test notification created:', response.data);
    } catch (error) {
      console.error('Error creating test notification:', error);
    }
  };

  if (loading) {
    return <Typography variant="body1">Loading your bids...</Typography>;
  }

  const hasNoBids = 
    bids.accepted.length === 0 && 
    bids.pending.length === 0 && 
    bids.rejected.length === 0;

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
        <CheckCircleIcon sx={{ mr: 1, color: '#003153' }} /> Confirmed Bids
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
              bids.rejected.map((bid, index) => (
                <TableRow key={bid._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{bid.productName}</TableCell>
                  <TableCell>
                    Rs. {bid.bidAmount} (per Kg)<br />
                    {bid.orderWeight} Kg
                  </TableCell>
                  <TableCell>Rejected</TableCell>
                  <TableCell>
                    <Button variant="contained" color="secondary">ReBid</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MyBids;
