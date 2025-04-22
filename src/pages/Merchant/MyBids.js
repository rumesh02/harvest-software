import React, { useState, useEffect } from "react";
import { Typography, Table, TableBody, TableCell, TableContainer, 
         TableHead, TableRow, Paper, Button, Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import axios from "axios";

const MyBids = () => {
  const [bids, setBids] = useState({
    accepted: [],
    pending: [],
    rejected: []
  });

  // Fetch bids from backend
  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/bids");
        const allBids = response.data;

        // Sort bids by status
        const sortedBids = {
          accepted: allBids.filter(bid => bid.status === "Accepted"),
          pending: allBids.filter(bid => bid.status === "Pending"),
          rejected: allBids.filter(bid => bid.status === "Rejected")
        };

        setBids(sortedBids);
      } catch (error) {
        console.error("Error fetching bids:", error);
      }
    };

    fetchBids();
    // Refresh every 30 seconds
    const interval = setInterval(fetchBids, 30000);
    return () => clearInterval(interval);
  }, []);


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
            {bids.accepted.map((bid, index) => (
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
            ))}
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
            {bids.pending.map((bid, index) => (
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
            ))}
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
            {bids.rejected.map((bid, index) => (
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MyBids;
