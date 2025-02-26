import React from "react";
import { Card, CardContent, CardMedia, Typography, Button, Grid } from "@mui/material";

const products = [
  {
    id: 1,
    name: "Cabbage",
    price: "Rs. 500/kg",
    available: "100 kg",
    farmer: "Sunimal Perera",
    location: "Nuwara Eliya",
    image: "https://source.unsplash.com/200x150/?cabbage",
  },
  {
    id: 2,
    name: "Beans",
    price: "Rs. 500/kg",
    available: "100 kg",
    farmer: "Sunimal Perera",
    location: "Nuwara Eliya",
    image: "https://source.unsplash.com/200x150/?beans",
  },
  {
    id: 3,
    name: "Carrots",
    price: "Rs. 500/kg",
    available: "100 kg",
    farmer: "Sunimal Perera",
    location: "Nuwara Eliya",
    image: "https://source.unsplash.com/200x150/?carrots",
  },
  {
    id: 4,
    name: "Potatoes",
    price: "Rs. 500/kg",
    available: "100 kg",
    farmer: "Sunimal Perera",
    location: "Nuwara Eliya",
    image: "https://source.unsplash.com/200x150/?potatoes",
  },
  {
    id: 5,
    name: "Fresh Apples",
    price: "Rs. 500/kg",
    available: "100 kg",
    farmer: "Sunimal Perera",
    location: "Nuwara Eliya",
    image: "https://source.unsplash.com/200x150/?apples",
  },
];

const PlaceBids = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h5" gutterBottom>
        Buy Now
      </Typography>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card sx={{ maxWidth: 345 }}>
              <CardMedia component="img" height="140" image={product.image} alt={product.name} />
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  <b>Product Details:</b>
                  <br />
                  <b>Name:</b> {product.name}
                  <br />
                  <b>Price:</b> {product.price}
                  <br />
                  <b>Available:</b> {product.available}
                  <br />
                  <b>Farmer:</b> {product.farmer}
                  <br />
                  <b>Location:</b> {product.location}
                </Typography>
              </CardContent>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px" }}>
                <Button variant="contained" color="warning">
                  Place Bid
                </Button>
                <Button variant="contained" color="secondary">
                  Cancel
                </Button>
              </div>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default PlaceBids;
