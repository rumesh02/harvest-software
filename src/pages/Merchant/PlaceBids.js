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
  Container,
} from "@mui/material";
import { useCart } from "../../context/CartContext";
import axios from "axios";

const PlaceBids = () => {
  const { cartItems, removeFromCart, updateCartItem } = useCart();
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [orderWeight, setOrderWeight] = useState("");

  // Open the dialog and set the selected product
  const handlePlaceBidClick = (product) => {
    setSelectedProduct(product);
    setOpen(true);
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
      // Get the farmer ID from the selected product
      const farmerId = selectedProduct.farmerID;
      const authenticatedMerchantId = localStorage.getItem('user_id');

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

      const response = await axios.post("http://localhost:5000/api/bids", bidData);

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
      alert("✅ Bid successfully submitted! The farmer has been notified and will review your bid. The product has been removed from your cart.");
    } catch (error) {
      console.error("Error submitting bid:", error);
      alert(`Bid submission failed: ${error.response?.data?.message || error.message}`);
    }
  };

  // Refresh product in cart
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
    <Container sx={{ mt: 4, px: 3 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight={600} mb={3} sx={{ color: "#D97706", fontSize: "2.2rem" }}>
        🛒 Selected Products
      </Typography>
      <Grid 
        container 
        spacing={{ xs: 1, sm: 2, md: 3 }}
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'stretch',
          width: '100%',
          margin: 0
        }}
      >
        {cartItems.map((product, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card sx={{
              borderRadius: "12px",
              overflow: "hidden",
              textAlign: "center",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background: "#FFEDD5",
              border: "2px solid #FFD29D",
              minHeight: "420px",
              maxHeight: "420px",
              width: '320px',
              minWidth: '320px',
              maxWidth: '320px',
              margin: '0 auto',
              transition: "all 0.3s ease",
              '&:hover': {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.12)"
              }
            }}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                <CardMedia
                  component="img"
                  height="150"
                  image={product.img || product.image}
                  alt={product.name}
                  sx={{
                    transition: "transform 0.3s ease",
                    '&:hover': {
                      transform: "scale(1.05)"
                    }
                  }}
                />
                <Box sx={{ p: 2.5 }}>
                  <Typography variant="h6" fontWeight={600} mt={1} sx={{ color: "#B45309", fontSize: "1.2rem" }}>
                    {product.name}
                  </Typography>
                  {product.location && (
                    <Typography variant="caption" sx={{ color: '#388E3C', display: 'block', mb: 1, fontSize: '0.9rem' }}>
                      <span role="img" aria-label="map">🗺️</span> Location: {product.location.lat.toFixed(4)}, {product.location.lng.toFixed(4)}
                    </Typography>
                  )}
                  {product.price && (
                    <Typography variant="h6" sx={{ color: "#D97706", fontWeight: 600, fontSize: "1.3rem", mb: 1 }}>
                      Rs. {product.price}
                    </Typography>
                  )}
                  {product.quantity && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: product.quantity <= 0 ? 'error.main' :
                          product.quantity <= 10 ? '#D97706' : '#374151',
                        fontWeight: product.quantity <= 10 ? 'bold' : 'normal',
                        fontSize: '1rem',
                        mb: 1
                      }}
                    >
                      Qty: {product.quantity} kg
                      {product.quantity <= 0 && ' (Out of Stock)'}
                      {product.quantity > 0 && product.quantity <= 10 && ' (Low Stock)'}
                    </Typography>
                  )}
                  {product.listedDate && (
                    <Typography variant="caption" sx={{ color: "#D97706", fontSize: '0.9rem' }}>
                      Listed: {new Date(product.listedDate).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  disabled={product.quantity <= 0}
                  sx={{
                    flex: 1,
                    height: '48px',
                    minHeight: '48px',
                    maxHeight: '48px',
                    backgroundColor: product.quantity <= 0 ? "#ccc" : "#D97706",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    borderRadius: "10px",
                    p: 0,
                    '&:hover': {
                      backgroundColor: product.quantity <= 0 ? "#ccc" : "#B45309",
                    },
                  }}
                  onClick={() => handlePlaceBidClick(product)}
                >
                  {product.quantity <= 0 ? "Out of Stock" : "Place Bid"}
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    flex: 1,
                    height: '48px',
                    minHeight: '48px',
                    maxHeight: '48px',
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    borderRadius: "10px",
                    backgroundColor: '#DC2626',
                    color: '#fff',
                    p: 0,
                    '&:hover': {
                      backgroundColor: '#B91C1C',
                      color: '#fff',
                    },
                  }}
                  onClick={() => removeFromCart(product.name)}
                >
                  Remove
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Dialog for entering bid details */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            background: "#FFF8EC",
            borderRadius: 3,
            border: "2px solid #FFD29D"
          }
        }}
      >
        <DialogTitle sx={{ color: '#D97706', fontWeight: 700, fontSize: '1.5rem', pb: 0 }}>
          Enter Bid Details
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              color: '#D97706',
              fontWeight: 'bold',
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            Product: {selectedProduct?.name}
          </Typography>
          <Box sx={{ mb: 2, p: 2, backgroundColor: '#FFF8EC', borderRadius: 1, border: '1.5px solid #FFD29D' }}>
            <Typography variant="body2" sx={{ color: '#B45309' }}>
              <strong>Available Quantity:</strong> {selectedProduct?.quantity} kg
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#B45309',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              <strong>Listed Price:</strong> Rs. {selectedProduct?.price}
            </Typography>
          </Box>
          <TextField
            label="Bid Amount (Rs.)"
            type="number"
            fullWidth
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            sx={{ marginBottom: "15px", background: 'white', borderRadius: '10px' }}
            helperText={`Must be at least Rs. ${selectedProduct?.price}`}
            inputProps={{ min: selectedProduct?.price || 0 }}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
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
            sx={{ background: 'white', borderRadius: '10px' }}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
          {orderWeight && selectedProduct && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#FEF3C7', borderRadius: 1, border: '1.5px solid #FFD29D' }}>
              <Typography variant="body2" sx={{ color: '#92400E' }}>
                <strong>Order Summary:</strong>
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#92400E',
                  mb: 0.5,
                  fontSize: { xs: '0.813rem', sm: '0.875rem' }
                }}
              >
                Weight: {orderWeight} kg
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#92400E',
                  fontSize: { xs: '0.813rem', sm: '0.875rem' }
                }}
              >
                Total Bid Value: Rs. {(Number(bidAmount) * Number(orderWeight)).toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: '1px solid #E5E7EB',
          padding: { xs: '12px 16px', sm: '16px 24px' },
          gap: { xs: 1, sm: 2 }
        }}>
          <Button 
            onClick={handleClose}
            size="small"
            sx={{
              color: '#6B7280',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              padding: { xs: '6px 12px', sm: '8px 16px' },
              '&:hover': {
                backgroundColor: '#F3F4F6'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitBid}
            variant="contained"
            size="small"
            disabled={!bidAmount || !orderWeight || Number(orderWeight) > Number(selectedProduct?.quantity)}
            sx={{
              backgroundColor: "#D97706",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "10px",
              '&:hover': {
                backgroundColor: "#B45309",
              },
            }}
          >
            Submit Bid
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PlaceBids;