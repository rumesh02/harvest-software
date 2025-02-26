import React from "react";
import { Box, Typography, Card, CardMedia, CardContent, Button, Grid } from "@mui/material";

const purchases = [
  {
    id: 1,
    image: "https://source.unsplash.com/200x200/?cabbage", // Replace with actual image URL
    date: "2025-02-10",
    farmer: "Sunimal Perera",
    price: "Rs. 5000",
    quantity: "10 kg",
    status: "Delivered",
  },
  {
    id: 2,
    image: "https://source.unsplash.com/200x200/?onion", // Replace with actual image URL
    date: "2025-02-10",
    farmer: "Sunimal Perera",
    price: "Rs. 5000",
    quantity: "10 kg",
    status: "Delivered",
  },
];

const PurchaseHistory = () => {
  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h5" gutterBottom>Purchase History</Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>🛒 Recent Purchases</Typography>

      <Grid container spacing={3}>
        {purchases.map((purchase) => (
          <Grid item xs={12} sm={6} md={4} key={purchase.id}>
            <Card sx={{ maxWidth: 345, boxShadow: 3 }}>
              <CardMedia component="img" height="200" image={purchase.image} alt={purchase.product} />
              <CardContent>
                <Typography variant="body1"><strong>Purchased on:</strong> {purchase.date}</Typography>
                <Typography variant="body1"><strong>Farmer:</strong> {purchase.farmer}</Typography>
                <Typography variant="body1"><strong>Price:</strong> {purchase.price}</Typography>
                <Typography variant="body1"><strong>Quantity:</strong> {purchase.quantity}</Typography>
                <Typography variant="body1"><strong>Status:</strong> {purchase.status}</Typography>
              </CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
                <Button variant="contained" color="warning">View Invoice</Button>
                <Button variant="contained" color="success">Rate Farmer</Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PurchaseHistory;
