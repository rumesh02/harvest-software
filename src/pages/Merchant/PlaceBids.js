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
    image: "https://d1obh0a64dzipo.cloudfront.net/images/4380.jpg",
  },
  {
    id: 2,
    name: "Beans",
    price: "Rs. 500/kg",
    available: "100 kg",
    farmer: "Sunimal Perera",
    location: "Nuwara Eliya",
    image: "https://th.bing.com/th/id/OIP.4XW3qsorY_xMUonq--h19QHaEl?w=1920&h=1190&rs=1&pid=ImgDetMain",
  },
  {
    id: 3,
    name: "Carrots",
    price: "Rs. 500/kg",
    available: "100 kg",
    farmer: "Sunimal Perera",
    location: "Nuwara Eliya",
    image: "https://garche.jp/wp-content/uploads/2021/01/5cf12d1a-145b-4ef9-8884-fc0101eb5312.jpg",
  },
  {
    id: 4,
    name: "Potatoes",
    price: "Rs. 500/kg",
    available: "100 kg",
    farmer: "Sunimal Perera",
    location: "Nuwara Eliya",
    image: "https://kj1bcdn.b-cdn.net/media/65042/n.jpg",
  },
  {
    id: 5,
    name: "Fresh Apples",
    price: "Rs. 500/kg",
    available: "100 kg",
    farmer: "Sunimal Perera",
    location: "Nuwara Eliya",
    image: "https://th.bing.com/th/id/OIP.at4Ylta_qj1J2ybQjf2TQgHaEU?w=600&h=350&rs=1&pid=ImgDetMain",
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
                <Button variant="contained" color="secondary">
                  Place Bid
                </Button>
                <Button variant="contained" color="warning">
                  Remove
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
