import React, { useState, useEffect } from "react";
import { Typography, Table, TableBody, TableCell, TableContainer, 
         TableHead, TableRow, Paper, Button, Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react"; // Import Auth0 hook

const MyBids = () => {
  const { user } = useAuth0(); // Get the current user from Auth0
  const [bids, setBids] = useState({
    accepted: [],
    pending: [],
    rejected: []
  });
  const [loading, setLoading] = useState(true);

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
          accepted: merchantBids.filter(bid => bid.status === "Accepted"),
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
                    <Button variant="contained" color="warning">Confirm Order</Button>
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
