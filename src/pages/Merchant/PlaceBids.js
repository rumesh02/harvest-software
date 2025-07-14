import React, { useState, useEffect } from 'react';
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
  Box,
} from "@mui/material";
import { useCart } from "../../context/CartContext";
import axios from "axios";

const PlaceBids = () => {
  const { cartItems, removeFromCart, updateCartItem } = useCart(); // <-- Add updateCartItem if not present
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

    // Frontend validation for order weight
    const orderWeightNum = Number(orderWeight);
    const availableQuantity = Number(selectedProduct.quantity);
    
    if (orderWeightNum <= 0) {
      alert("Order weight must be greater than 0.");
      return;
    }
    
    if (orderWeightNum > availableQuantity) {
      alert(`Order weight (${orderWeightNum} kg) cannot exceed available quantity (${availableQuantity} kg). Please reduce your order weight.`);
      return;
    }

    // Frontend validation for bid amount
    const bidAmountNum = Number(bidAmount);
    const productPrice = Number(selectedProduct.price);
    
    if (bidAmountNum < productPrice) {
      alert(`Bid amount (Rs. ${bidAmountNum}) must be at least the farmer's listed price (Rs. ${productPrice}).`);
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
        bidAmount: bidAmountNum,
        orderWeight: orderWeightNum,
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

      // Update the product in the cart with the new quantity
      if (response.data.updatedProduct) {
        updateCartItem(response.data.updatedProduct._id, {
          ...selectedProduct,
          quantity: response.data.updatedProduct.quantity
        });
      }

      // Remove the product from cart after successful bid
      removeFromCart(selectedProduct.name);

      // Close dialog and reset form fields
      setOpen(false);
      setBidAmount("");
      setOrderWeight("");
      setSelectedProduct(null);
      alert("Bid successfully submitted! The product has been removed from your cart.");
    } catch (error) {
      console.error("Error submitting bid:", error);
      alert(`Bid submission failed: ${error.response?.data?.message || error.message}`);
    }
  };

  // Add this inside PlaceBids.js
  const refreshCartProduct = async (productId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/${productId}`);
      const updatedProduct = response.data;
      updateCartItem(productId, { ...updatedProduct, quantity: updatedProduct.quantity });
    } catch (error) {
      console.error("Failed to refresh product in cart:", error);
    }
  };

  useEffect(() => {
    const refreshAllCartItems = async () => {
      for (const item of cartItems) {
        await refreshCartProduct(item._id || item.productID);
      }
    };
    refreshAllCartItems();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      cartItems.forEach(item => {
        refreshCartProduct(item._id || item.productID);
      });
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [cartItems]);

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
                {product.location && (
                  <>
                    <br />
                    <span style={{ color: '#388E3C' }}>
                      <span role="img" aria-label="map">🗺️</span> Location: {product.location.lat.toFixed(4)}, {product.location.lng.toFixed(4)}
                    </span>
                  </>
                )}
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
                onClick={() => handlePlaceBidClick(product)}
                disabled={product.quantity <= 0} // Disable if out of stock
              >
                {product.quantity <= 0 ? "Out of Stock" : "Place Bid"}
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
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Enter Bid Details</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#D97706', fontWeight: 'bold' }}>
            {selectedProduct?.name}
          </Typography>
          
          <Box sx={{ mb: 2, p: 2, backgroundColor: '#FFF8EC', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: '#B45309' }}>
              <strong>Available Quantity:</strong> {selectedProduct?.quantity} kg
            </Typography>
            <Typography variant="body2" sx={{ color: '#B45309' }}>
              <strong>Listed Price:</strong> Rs. {selectedProduct?.price}
            </Typography>
          </Box>
          
          <TextField
            label="Bid Amount (Rs.)"
            type="number"
            fullWidth
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            sx={{ marginBottom: "15px" }}
            helperText={`Must be at least Rs. ${selectedProduct?.price}`}
            inputProps={{ min: selectedProduct?.price || 0 }}
          />
          
          <TextField
            label="Order Weight (kg)"
            type="number"
            fullWidth
            value={orderWeight}
            onChange={(e) => setOrderWeight(e.target.value)}
            helperText={`Maximum: ${selectedProduct?.quantity} kg`}
            inputProps={{ 
              min: 0.1, 
              max: selectedProduct?.quantity || 0,
              step: 0.1
            }}
          />
          
          {orderWeight && selectedProduct && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#FEF3C7', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: '#92400E' }}>
                <strong>Order Summary:</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: '#92400E' }}>
                Weight: {orderWeight} kg
              </Typography>
              <Typography variant="body2" sx={{ color: '#92400E' }}>
                Total Bid Value: Rs. {(Number(bidAmount) * Number(orderWeight)).toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitBid} 
            color="primary"
            variant="contained"
            disabled={!bidAmount || !orderWeight || Number(orderWeight) > Number(selectedProduct?.quantity)}
          >
            Submit Bid
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default PlaceBids;