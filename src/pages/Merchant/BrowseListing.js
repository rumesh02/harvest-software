import React, { useState, useEffect, useCallback } from "react";
import { Box, Container, Typography, TextField, Grid, Card, CardMedia, CardActions, Button, 
 InputAdornment, Autocomplete, Skeleton, Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { setupProductUpdateListeners, joinUserRoom, disconnectSocket } from "../../socket";

// Sri Lankan districts for dropdown
const districts = [
  "All Districts", "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", 
  "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", 
  "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", 
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", 
  "Monaragala", "Ratnapura", "Kegalle"
];

const BrowseListing = () => {
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("All Districts");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const { addToCart } = useCart();

  // Function to update product in the list
  const updateProductInList = useCallback((productId, updatedProduct) => {
    setFetchedProducts(prevProducts => 
      prevProducts.map(product => 
        product._id === productId ? { ...product, ...updatedProduct } : product
      )
    );
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  // Debounced filter effect to prevent too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1); // Reset to first page when filters change
      fetchProducts();
    }, 500); // Increased delay for better performance

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line
  }, [searchQuery, districtFilter, maxPrice]);

  // Separate effect for page changes only
  useEffect(() => {
    if (page > 1) {
      fetchProducts();
    }
    // eslint-disable-next-line
  }, [page]);

  // Setup socket listeners for real-time updates
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      joinUserRoom(userId);
      setupProductUpdateListeners(null, updateProductInList);
      
      return () => {
        disconnectSocket();
      };
    }
  }, [updateProductInList]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Build query parameters carefully
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '8');

      // Only add filters if they have meaningful values
      if (searchQuery && searchQuery.trim().length > 0) {
        params.append('search', searchQuery.trim());
      }

      if (districtFilter && districtFilter !== "All Districts") {
        params.append('district', districtFilter);
      }

      if (maxPrice && !isNaN(maxPrice) && maxPrice > 0) {
        params.append('maxPrice', maxPrice.toString());
      }

      console.log('Filter params being sent:', Object.fromEntries(params));

      const res = await axios.get(`http://localhost:5000/api/products?${params.toString()}`);
      
      console.log('API Response:', res.data);
      
      if (res.data && res.data.products) {
        setFetchedProducts(res.data.products);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setFetchedProducts([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setFetchedProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      farmerID: product.farmerID
    });
    setSnackbarMsg(
      <span>
        <ShoppingCartIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        <b>{product.name}</b> added to your cart!
      </span>
    );
    setSnackbarOpen(true);
  };

  const allProducts = fetchedProducts;

  // Handler functions for filter changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDistrictChange = (event, newValue) => {
    setDistrictFilter(newValue || "All Districts");
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    setMaxPrice(value === "" ? "" : Number(value));
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setDistrictFilter("All Districts");
    setMaxPrice("");
    setPage(1);
  };

  return (
    <Container sx={{ mt: 4, px: 3 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight={600} mb={3} sx={{ color: "#D97706", fontSize: "2.2rem" }}>
        🛒 Items
      </Typography>

      {/* Search Bar and Filters */}
      <Box sx={{ background: "#FFF8EC", padding: "30px", borderRadius: "15px", mb: 4, border: "2px solid #FFD29D", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
        <Typography variant="h6" fontWeight={600} mb={3} sx={{ color: "#B45309", fontSize: "1.4rem" }}>
          Search & Filter Products
        </Typography>
        <Grid container spacing={3} alignItems="flex-end">
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Search Products"
              placeholder="Enter product name..."
              variant="outlined"
              size="medium"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              InputLabelProps={{
                shrink: true,
                sx: { marginTop: 0, fontSize: '20px' }
              }}
              sx={{ 
                background: "white", 
                borderRadius: "10px",
                "& .MuiOutlinedInput-root": {
                  fontSize: "1.1rem",
                  "&:hover fieldset": {
                    borderColor: "#D97706",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#D97706",
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 3 }}>
            <Autocomplete
              value={districtFilter}
              onChange={handleDistrictChange}
              options={districts}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="District"
                  placeholder="Select district..."
                  size="medium"
                  InputLabelProps={{
                    shrink: true,
                    sx: { marginTop: 0, fontSize: '20px' }
                  }}
                  sx={{ 
                    background: "white", 
                    borderRadius: "10px",
                    "& .MuiOutlinedInput-root": {
                      fontSize: "1.1rem",
                      "&:hover fieldset": {
                        borderColor: "#D97706",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#D97706",
                      }
                    }
                  }}
                />
              )}
              sx={{ width: "100%" }}
              disableClearable
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Max Price (Rs)"
              type="number"
              size="medium"
              fullWidth
              placeholder="Enter max price..."
              value={maxPrice}
              onChange={handlePriceChange}
              InputLabelProps={{
                shrink: true,
                sx: { marginTop: 0, fontSize: '20px' }
              }}
              sx={{ 
                background: "white", 
                borderRadius: "10px",
                "& .MuiOutlinedInput-root": {
                  fontSize: "1.1rem",
                  "&:hover fieldset": {
                    borderColor: "#D97706",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#D97706",
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon color="action" />
                  </InputAdornment>
                ),
              }}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleClearFilters}
              sx={{
                backgroundColor: "#D97706",
                color: "white",
                fontWeight: 600,
                height: "56px",
                borderRadius: "10px",
                fontSize: "1.1rem",
                '&:hover': {
                  backgroundColor: "#B45309",
                },
                textTransform: "none"
              }}
            >
              Clear All Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Product Grid */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 3, p: 3, background: "#F8F9FA", borderRadius: "12px", border: "2px solid #E9ECEF" }}>
        <Typography variant="h5" fontWeight={600} sx={{ color: "#FFA000", fontSize: "1.6rem" }}>
          🌾 Fresh Harvest Products
        </Typography>
        {(searchQuery || districtFilter !== "All Districts" || maxPrice) && (
          <Typography variant="h6" sx={{ color: "#B45309", fontStyle: 'italic', background: "#E3F2FD", px: 2, py: 1, borderRadius: "8px", fontSize: "1.1rem" }}>
            {fetchedProducts.length} product(s) found
          </Typography>
        )}
      </Box>
      
      {loading ? (
        <Grid container spacing={3}>
          {[...Array(8)].map((_, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={idx}>
              <Card sx={{ borderRadius: "12px", overflow: "hidden", textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "320px" }}>
                <Skeleton variant="rectangular" height={150} />
                <Box sx={{ p: 3 }}>
                  <Skeleton variant="text" width="60%" sx={{ fontSize: "1.2rem" }} />
                  <Skeleton variant="text" width="40%" sx={{ fontSize: "1rem" }} />
                  <Skeleton variant="text" width="50%" sx={{ fontSize: "1rem" }} />
                </Box>
                <CardActions sx={{ p: 2 }}>
                  <Skeleton variant="rectangular" width="100%" height={45} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : allProducts.length > 0 ? (
        <Grid container spacing={3}>
          {allProducts.slice().reverse().map((product, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
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
                minHeight: "380px",
                transition: "all 0.3s ease",
                '&:hover': {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.12)"
                }
              }}>
                <Box>
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
                    {product.harvestDetails?.location && (
                      <Typography variant="caption" sx={{ color: "#B45309", fontSize: '0.9rem' }} display="block">
                        Location: {product.harvestDetails.location}
                      </Typography>
                    )}
                    {product.listedDate && (
                      <Typography variant="caption" sx={{ color: "#D97706", fontSize: '0.9rem' }}>
                        Listed: {new Date(product.listedDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <CardActions sx={{ p: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    disabled={product.quantity <= 0}
                    sx={{
                      width: "100%",
                      backgroundColor: product.quantity <= 0 ? "#ccc" : "#D97706",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "1.1rem",
                      py: 1.5,
                      borderRadius: "10px",
                      '&:hover': {
                        backgroundColor: product.quantity <= 0 ? "#ccc" : "#B45309",
                      },
                    }}
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCartIcon sx={{ mr: 1 }} />
                    {product.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 6, py: 6 }}>
          <Typography variant="h4" sx={{ fontSize: "4rem", opacity: 0.3, mb: 2 }}>📦</Typography>
          <Typography variant="h5" sx={{ color: "#6B7280", mb: 2, fontSize: "1.4rem" }}>
            No products found matching your criteria
          </Typography>
          <Typography variant="body1" sx={{ color: "#9CA3AF", fontSize: "1.1rem" }}>
            Try adjusting your search filters or check back later for new products
          </Typography>
        </Box>
      )}

      {/* Pagination Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5, mb: 3 }}>
        <Button
          variant="outlined"
          size="large"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          sx={{
            borderColor: "#D97706",
            color: "#B45309",
            fontSize: "1.1rem",
            px: 3,
            py: 1.5,
            borderRadius: "10px",
            '&:hover': {
              borderColor: "#B45309",
              backgroundColor: "#FFF8EC",
            },
            mr: 3,
          }}
        >
          Previous
        </Button>
        <Typography variant="h6" sx={{ mx: 3, alignSelf: 'center', color: '#B45309', fontWeight: 600, fontSize: "1.2rem" }}>
          Page {page} of {totalPages}
        </Typography>
        <Button
          variant="outlined"
          size="large"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          sx={{
            borderColor: "#D97706",
            color: "#B45309",
            fontSize: "1.1rem",
            px: 3,
            py: 1.5,
            borderRadius: "10px",
            '&:hover': {
              borderColor: "#B45309",
              backgroundColor: "#FFF8EC",
            },
          }}
        >
          Next
        </Button>
      </Box>

      {/* Snackbar for Add to Cart */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // <-- Change "bottom" to "top"
      >
        <MuiAlert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          elevation={6}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMsg}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default BrowseListing;