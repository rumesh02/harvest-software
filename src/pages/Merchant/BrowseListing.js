import React, { useState, useEffect } from "react";
import { Box, Container, Typography, TextField, Grid, Card, CardMedia, CardActions, Button } from "@mui/material";
import axios from "axios";

const products = [
  { name: "Cabbage", img: "/images/cabbage.jpg" },
  { name: "Carrots", img: "/images/carrot.jpg" },
  { name: "Long Beans", img: "/images/beans.jpg" },
  { name: "Red Onions", img: "/images/onions.jpg" },
  { name: "Potatoes", img: "/images/potato.jpg" },
  { name: "Spring Onions", img: "/images/springonions.jpg" },
  { name: "Pineapple", img: "/images/pineapples.webp" },
  { name: "Mangoes", img: "/images/mangoes.jpg" },
];

const BrowseListing = () => {

  const [fetchedProducts, setFetchedProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/products") // adjust your backend URL
      .then((res) => setFetchedProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
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
            <Card sx={{ borderRadius: "10px", overflow: "hidden", textAlign: "center" }}>
              <CardMedia component="img" height="120" image={product.img} alt={product.name} />
              <Typography variant="subtitle1" fontWeight={600} mt={1}>
                {product.name}
              </Typography>
              <CardActions>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    width: "100%",
                    backgroundColor: "#FFEFD5",
                    color: "#333", // Dark text for contrast
                    "&:hover": {
                      backgroundColor: "#FFDBA4", // Slightly darker on hover
                    },
                  }}
                >
                  Add to Cart
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dynamically Loaded Products */}
      <Typography variant="h6" fontWeight={600} mt={4} mb={2}>
        Live Listings from Farmers 🌿
      </Typography>
      <Grid container spacing={2}>
        {fetchedProducts.map((product, index) => (
          <Grid item xs={6} sm={4} md={3} key={index}>
            <Card sx={{ borderRadius: "10px", overflow: "hidden", textAlign: "center" }}>
              <CardMedia component="img" height="120" image={product.image} alt={product.name} />
              <Typography variant="subtitle1" fontWeight={600} mt={1}>
                {product.name}
              </Typography>
              <Typography variant="body2">Rs. {product.price}</Typography>
              <Typography variant="body2">Qty: {product.quantity}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(product.listedDate).toLocaleDateString()}
              </Typography>
              <CardActions>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    width: "100%",
                    backgroundColor: "#FFEFD5",
                    color: "#333",
                    "&:hover": {
                      backgroundColor: "#FFDBA4",
                    },
                  }}
                >
                  Add to Cart
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

    </Container>
  );
};

export default BrowseListing;
