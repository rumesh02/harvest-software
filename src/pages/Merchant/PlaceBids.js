import React, { useState } from "react";
import { Card, CardContent, CardMedia, Typography, Button, Grid,Dialog,DialogTitle,DialogContent,DialogActions,TextField} from "@mui/material";
import { useCart } from "../../context/CartContext";
import axios from "axios";

const PlaceBids = () => {
  const { cartItems, removeFromCart } = useCart();
  const [open, setOpen] = useState(false); // State to control the dialog
  const [selectedProduct, setSelectedProduct] = useState(null); // State to store the selected product
  const [bidAmount, setBidAmount] = useState(""); // State for bid amount
  const [orderWeight, setOrderWeight] = useState(""); // State for order weight

  // Open the dialog and set the selected product
  const handlePlaceBidClick = (product) => {
    console.log("Place Bid clicked for:", product); // Debugging
    setSelectedProduct(product);
    setOpen(true);
    console.log("Dialog open state:", open);
  };

  // Close the dialog
  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
    setBidAmount("");
    setOrderWeight("");
  };

  // Handle submitting the bid
  const handleSubmitBid = async () => {
    if (!bidAmount || !orderWeight) {
      alert("Please enter both bid amount and order weight.");
      return;
    }

  // Send the bid details to "My Bids" (API call)
      try {
        const response = await axios.post("http://localhost:5000/api/bids", {
          productId: selectedProduct._id,
          productName: selectedProduct.name,
          bidAmount: Number(bidAmount),
          orderWeight: Number(orderWeight),
        });
        console.log("Bid Submitted:", response.data);

  
  // Close the dialog and reset states
        handleClose();
        alert("Bid successfully submitted!");
      } catch (error) {
        console.error("Error submitting bid:", error);
        alert("Failed to submit the bid. Please try again.");
      }
    };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h5" gutterBottom>
        Selected Products
      </Typography>
      <Grid container spacing={3}>
        {cartItems.map((product, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ maxWidth: 345 }}>
              <CardMedia component="img" height="140" image={product.img || product.image} alt={product.name} />
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  <b>Name:</b> {product.name}
                  {product.price && (
                    <>
                      <br />
                      <b>Price:</b> Rs. {product.price}
                    </>
                  )}
                  {product.quantity && (
                    <>
                      <br />
                      <b>Quantity:</b> {product.quantity}
                    </>
                  )}
                </Typography>
              </CardContent>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px" }}>
                
              <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handlePlaceBidClick(product)} // Open the dialog
                >
                  Place Bid
                </Button>

                <Button
                  variant="contained"
                  color="warning"
                  sx={{ border: "1px solid red" }}
                  onClick={() => removeFromCart(product.name)} 
                >
                  Remove
                </Button>

              </div>
            </Card>
          </Grid>
        ))}
      </Grid>
    
      {/* Dialog for entering bid details */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Enter Bid Details</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Product: {selectedProduct?.name}
          </Typography>
          <TextField
            label="Bid Amount (Rs.)"
            type="number"
            fullWidth
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            sx={{ marginBottom: "10px" }}
          />
          <TextField
            label="Order Weight (kg)"
            type="number"
            fullWidth
            value={orderWeight}
            onChange={(e) => setOrderWeight(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmitBid} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default PlaceBids;