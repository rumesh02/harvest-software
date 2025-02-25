import React from "react";
import { Box, Container, Typography, TextField, Grid, Card, CardMedia } from "@mui/material";
import MerchantSidebar from "../components/MerchantSidebar";

// Sample images for products
const products = [
  { name: "Cabbage", img: "/images/cabbage.jpg" },
  { name: "Carrots", img: "/images/carrots.jpg" },
  { name: "Long Beans", img: "/images/longbeans.jpg" },
  { name: "Red Onions", img: "/images/onions.jpg" },
  { name: "Potatoes", img: "/images/potatoes.jpg" },
  { name: "Spring Onions", img: "/images/springonions.jpg" },
  { name: "Pineapple", img: "/images/pineapple.jpg" },
  { name: "Mangoes", img: "/images/mangoes.jpg" },
];

const BrowseListing = () => {
  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <MerchantSidebar />

      {/* Main Content */}
      <Container sx={{ mt: 4, ml: "260px" }}>
        {/* Header */}
        <Typography variant="h5" fontWeight={600} mb={2}>
          🛒 Items
        </Typography>

        {/* Search Bar */}
        <Box sx={{ background: "#FFEFD5", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
          <Typography variant="h6" fontWeight={600} mb={1}>
            Find fresh produce, place bids, and connect with top farmers!
          </Typography>
          <TextField
            placeholder="Search"
            variant="outlined"
            size="small"
            sx={{ background: "white", borderRadius: "5px", width: "250px" }}
          />
        </Box>

        {/* Product Grid */}
        <Typography variant="h6" fontWeight={600} mt={3} mb={2}>
          Buy Fresh Harvest!
        </Typography>
        <Grid container spacing={2}>
          {products.map((product, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Card sx={{ borderRadius: "10px", overflow: "hidden" }}>
                <CardMedia component="img" height="120" image={product.img} alt={product.name} />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default BrowseListing;
