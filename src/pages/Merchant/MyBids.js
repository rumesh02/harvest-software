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
        
        // Fetch bids from the backend
        const response = await axios.get("http://localhost:5000/api/bids");
        const allBids = response.data;
        
        // Filter bids to show only those belonging to the current merchant
        const merchantBids = allBids.filter(bid => bid.merchantId === merchantId);
        
        // Sort filtered bids by status
        const sortedBids = {
          accepted: merchantBids.filter(bid => bid.status === "Accepted" || bid.status === "Confirmed"),
          pending: merchantBids.filter(bid => bid.status === "Pending"),
          rejected: merchantBids.filter(bid => bid.status === "Rejected")
        };

        setBids(sortedBids);
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
      console.log('Status update response:', statusUpdateResponse.data);
  
      // Create a new confirmed bid record
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
      
      console.log('Sending confirmed bid data to backend:', confirmedBidData);
      const response = await axios.post('http://localhost:5000/api/confirmedbids', confirmedBidData);
      console.log('Confirmed bid creation response:', response.data);
      
      // Redirect to the Payments page with the ID and amount
      const finalPrice = bid.bidAmount * bid.orderWeight;
      console.log(`Navigating to payments with amount: ${finalPrice} and confirmedBidId: ${response.data._id}`);
      
      // Don't delete existing payment info, just add the new one to localStorage
      localStorage.setItem('payment_amount', finalPrice);
      localStorage.setItem('confirmed_bid_id', response.data._id);

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
      <Typography variant="h5" gutterBottom>My Bids</Typography>

      {/* Accepted Bids */}
      <Typography variant="h6" sx={{ display: "flex", alignItems: "center", color: "green", mb: 1 }}>
        <CheckCircleIcon sx={{ mr: 1 }} /> Accepted Bids (Won)
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
