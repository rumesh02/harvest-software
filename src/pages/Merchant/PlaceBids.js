import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
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
    console.log("Selected product for bid:", product); // Debugging
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

    try {
      console.log("Selected product for bid submission:", selectedProduct);

      // Get the farmer ID from the selected product
      const farmerId = selectedProduct.farmerID;
      const authenticatedMerchantId = localStorage.getItem('user_id');
      
      console.log('Bid Creation Details:', {
        farmerId: farmerId,
        merchantId: authenticatedMerchantId,
        productName: selectedProduct.name
      });
                      
      if (!farmerId) {
        throw new Error("Missing farmer ID for the selected product");
      }

      if (farmerId === authenticatedMerchantId) {
        throw new Error("Invalid farmer ID - matches merchant ID");
      }

      // Fetch merchant details from the backend
      const merchantResponse = await axios.get(`http://localhost:5000/api/users/${authenticatedMerchantId}`);
      const merchant = merchantResponse.data;

      if (!merchant) {
        throw new Error("Merchant details not found");
      }

      // Create bid data object with correct IDs
      const bidData = {
        productId: selectedProduct._id || selectedProduct.productID,
        productName: selectedProduct.name,
        bidAmount: Number(bidAmount),
        orderWeight: Number(orderWeight),
        farmerId: farmerId, // Farmer ID from product
        merchantId: authenticatedMerchantId, // Authenticated merchant's ID
        merchantName: merchant.name, // Retrieved from backend
        merchantPhone: merchant.phone // Retrieved from backend
      };

      console.log('Bid data before validation:', bidData);

      if (!bidData.farmerId) {
        throw new Error('FarmerID is required for bid submission');
      }

      // Validate all required fields are present
      const requiredFields = [
        'productId',
        'productName',
        'bidAmount',
        'orderWeight',
        'farmerId',
        'merchantId',
        'merchantName',
        'merchantPhone'
      ];

      const missingFields = requiredFields.filter(field => !bidData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      console.log("Selected product before submitting bid:", selectedProduct);

      console.log('Submitting bid data:', bidData); // Debug log

      const response = await axios.post("http://localhost:5000/api/bids", bidData);
      console.log("Bid Submitted:", response.data);

      // Close dialog and reset form fields but DON'T remove from cart
      setOpen(false);
      setBidAmount("");
      setOrderWeight("");
      setSelectedProduct(null);
      
      // Show success message that indicates the product remains in your cart for additional bids until you remove it.
      alert("Bid successfully submitted! The product remains in your cart for additional bids until you remove it.");
    } catch (error) {
      console.error("Error submitting bid:", error);
      alert(`Bid submission failed: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h5" gutterBottom>
        Selected Products
      </Typography>
      <Grid container spacing={3}>
        {cartItems.map((product, index) => {
          console.log('Product in cart:', product); // Debug log
         return(
          <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{ maxWidth: 345 }}>
            <CardMedia component="img" height="140" image={product.img || product.image} alt={product.name} />
            {/* Card content showing product details */}
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
         );
  })}
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