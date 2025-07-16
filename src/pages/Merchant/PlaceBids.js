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
      alert("Bid successfully submitted! The product has been removed from your cart.");
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
    <div style={{ padding: { xs: "12px", sm: "16px", md: "20px" } }}>
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{
          color: '#374151',
          fontWeight: 'bold',
          mb: { xs: 2, sm: 3 },
          fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
        }}
      >
        Selected Products
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
          <Grid 
            item 
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Card sx={{ 
              width: { xs: '100%', sm: '280px', md: '300px' },
              minHeight: { xs: 'auto', sm: '400px' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: { xs: '6px', sm: '8px' },
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: { sm: 'translateY(-4px)' },
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
              }
            }}>
              <div style={{ 
                width: '100%', 
                position: 'relative',
                paddingTop: '66.67%' // 3:2 aspect ratio
              }}>
                <CardMedia 
                  component="img" 
                  image={product.img || product.image} 
                  alt={product.name}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <CardContent sx={{ 
                flexGrow: 1, 
                padding: { xs: '12px', sm: '16px' }
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    fontWeight: 'bold',
                    mb: { xs: 1, sm: 2 },
                    color: '#374151',
                    lineHeight: 1.2
                  }}
                >
                  {product.name}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: { xs: '6px', sm: '8px' }
                }}>
                  {product.location && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: '#388E3C',
                      fontSize: { xs: '0.813rem', sm: '0.875rem' }
                    }}>
                      <span role="img" aria-label="map" style={{ marginRight: '4px' }}>🗺️</span>
                      <span style={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        Location: {product.location.lat.toFixed(4)}, {product.location.lng.toFixed(4)}
                      </span>
                    </Box>
                  )}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: { xs: '2px 0', sm: '4px 0' }
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        fontSize: { xs: '0.813rem', sm: '0.875rem' }
                      }}
                    >
                      Price:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#D97706',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.813rem', sm: '0.875rem' }
                      }}
                    >
                      Rs. {product.price}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: { xs: '2px 0', sm: '4px 0' }
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        fontSize: { xs: '0.813rem', sm: '0.875rem' }
                      }}
                    >
                      Quantity:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#059669',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.813rem', sm: '0.875rem' }
                      }}
                    >
                      {product.quantity} kg
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <Box sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                padding: { xs: '12px', sm: '16px' },
                gap: { xs: '6px', sm: '8px' },
                borderTop: '1px solid #E5E7EB'
              }}>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    flex: 2,
                    backgroundColor: product.quantity <= 0 ? '#9CA3AF' : '#D97706',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: product.quantity <= 0 ? '#9CA3AF' : '#B45309'
                    },
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    padding: { xs: '6px 12px', sm: '8px 16px' },
                    minHeight: { xs: '32px', sm: '36px' }
                  }}
                  onClick={() => handlePlaceBidClick(product)}
                  disabled={product.quantity <= 0}
                >
                  {product.quantity <= 0 ? "Out of Stock" : "Place Bid"}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    flex: 1,
                    color: '#DC2626',
                    borderColor: '#DC2626',
                    '&:hover': {
                      backgroundColor: '#FEE2E2',
                      borderColor: '#DC2626'
                    },
                    textTransform: 'none',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    padding: { xs: '6px 12px', sm: '8px 16px' },
                    minHeight: { xs: '32px', sm: '36px' }
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
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            width: { xs: '95%', sm: '80%', md: '600px' },
            margin: { xs: '16px', sm: 'auto' },
            borderRadius: { xs: '8px', sm: '10px' }
          }
        }}
      >
        <DialogTitle sx={{
          color: '#374151',
          fontWeight: 'bold',
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          borderBottom: '1px solid #E5E7EB',
          padding: { xs: '16px', sm: '20px' }
        }}>
          Enter Bid Details
        </DialogTitle>
        <DialogContent sx={{ 
          padding: { xs: '16px', sm: '24px' },
          mt: { xs: 1, sm: 2 }
        }}>
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
          <Box sx={{ 
            mb: { xs: 2, sm: 3 }, 
            p: { xs: 1.5, sm: 2 }, 
            backgroundColor: '#FFF8EC', 
            borderRadius: '8px',
            border: '1px solid #FDE68A'
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#B45309',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                mb: 1
              }}
            >
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
            sx={{ 
              mb: { xs: 2, sm: 3 },
              '& .MuiInputLabel-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              },
              '& .MuiOutlinedInput-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
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
            sx={{ 
              '& .MuiInputLabel-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              },
              '& .MuiOutlinedInput-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
            helperText={`Maximum: ${selectedProduct?.quantity} kg`}
            inputProps={{
              min: 0.1,
              max: selectedProduct?.quantity || 0,
              step: 0.1
            }}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
          {orderWeight && selectedProduct && (
            <Box sx={{ 
              mt: { xs: 2, sm: 3 }, 
              p: { xs: 1.5, sm: 2 }, 
              backgroundColor: '#FEF3C7', 
              borderRadius: '8px',
              border: '1px solid #FDE68A'
            }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: '#92400E',
                  fontWeight: 'bold',
                  mb: 1,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Order Summary
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
              backgroundColor: '#D97706',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              padding: { xs: '6px 12px', sm: '8px 16px' },
              '&:hover': {
                backgroundColor: '#B45309'
              },
              '&.Mui-disabled': {
                backgroundColor: '#9CA3AF'
              }
            }}
          >
            Submit Bid
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PlaceBids;