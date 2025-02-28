import React from "react";
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

const acceptedBids = [
  { id: 1, product: "Carrot", bid: "Rs. 270 (1Kg)", quantity: "150Kg", finalPrice: "Rs. 40,500" },
  { id: 2, product: "Onion", bid: "Rs. 170 (1Kg)", quantity: "200Kg", finalPrice: "Rs. 40,500" },
];

const rejectedBids = [
  { id: 1, product: "Cabbage", bid: "Rs. 270 (1Kg)", reason: "Price too low" },
];

const MyBids = () => {
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
            {acceptedBids.map((bid, index) => (
              <TableRow key={bid.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{bid.product}</TableCell>
                <TableCell>{bid.bid} <br /> {bid.quantity}</TableCell>
                <TableCell>{bid.finalPrice}</TableCell>
                <TableCell>
                  <Button variant="contained" color="warning">Confirm Order</Button>
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
              <TableCell>Reason</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rejectedBids.map((bid, index) => (
              <TableRow key={bid.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{bid.product}</TableCell>
                <TableCell>{bid.bid}</TableCell>
                <TableCell>{bid.reason}</TableCell>
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
