import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  InputAdornment,
  Autocomplete,
  Skeleton,
  Snackbar,
  Paper,
  Chip,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Rating
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import {
  setupProductUpdateListeners,
  joinUserRoom,
  disconnectSocket,
} from "../../socket";

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

  // Add these states for See More functionality
  const [seeMoreOpen, setSeeMoreOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [farmerInfo, setFarmerInfo] = useState(null);
  const [loadingFarmer, setLoadingFarmer] = useState(false);

  const updateProductInList = useCallback((productId, updatedProduct) => {
    setFetchedProducts(prev => prev.map(p => (p._id === productId ? { ...p, ...updatedProduct } : p)));
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 8, sort: 'desc', sortBy: 'listedDate' });
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (districtFilter !== "All Districts") params.append("district", districtFilter);
      if (maxPrice && maxPrice > 0) params.append("maxPrice", maxPrice);

      const res = await axios.get(`http://localhost:5000/api/products?${params}`);
      if (res.data?.products) {
        setFetchedProducts(res.data.products);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setFetchedProducts([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setFetchedProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, districtFilter, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, districtFilter, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [page, fetchProducts]);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      joinUserRoom(userId);
      setupProductUpdateListeners(null, updateProductInList);
      return () => disconnectSocket();
    }
  }, [updateProductInList]);

  const handleAddToCart = (product) => {
    addToCart({ ...product, farmerID: product.farmerID });
    setSnackbarMsg(
      <span>
        <ShoppingCartIcon sx={{ verticalAlign: "middle", mr: 1 }} />
        <b>{product.name}</b> added to your cart!
      </span>
    );
    setSnackbarOpen(true);
  };

  // Add the handleSeeMore function
  const handleSeeMore = async (product) => {
    setSelectedProduct(product);
    setSeeMoreOpen(true);
    setLoadingFarmer(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${product.farmerID}`);
      setFarmerInfo(res.data);
    } catch (error) {
      console.error("Failed to fetch farmer info:", error);
      setFarmerInfo(null);
    } finally {
      setLoadingFarmer(false);
    }
  };

  const renderProductCard = (product, index) => (
    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} key={index} sx={{ display: 'flex', justifyContent: 'flex-start', p: 0 }}>
      <Card sx={{
        display: 'flex',
        flexDirection: 'column',
        width: 220, // Reduced width for 4 cards per row
        height: 320, // Reduced height proportionally
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        m: '0 auto',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
        }
      }}>
        {/* Product Image */}
        <CardMedia
          component="img"
          image={product.img || product.image || "/images/placeholder.png"}
          alt={product.name}
          sx={{
            width: '100%',
          height: 120, // Reduced for smaller card
            objectFit: 'cover',
            backgroundColor: '#f8f9fa'
          }}
          onError={(e) => {
            e.target.src = "/images/placeholder.png";
          }}
        />
        
        {/* Card Content */}
        <CardContent sx={{ 
          flexGrow: 1, 
          display: "flex", 
          flexDirection: "column",
          p: 1, // Further reduced padding
          pb: 0.5
        }}>
          {/* Product Name and Listed Date Row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.4 }}>
            <Typography 
              variant="h6" 
              fontWeight="600" 
              sx={{ 
                fontSize: '0.9rem', // Further reduced font size
                lineHeight: 1.1,
                color: '#2c3e50',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                minHeight: '2em', // Reduced minHeight
                flex: 1,
                pr: 1
              }}
            >
              {product.name}
            </Typography>
            <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 1 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.5rem', // Further reduced font size
                  fontWeight: 600,
                  color: '#666',
                  display: 'block',
                  lineHeight: 1.1
                }}
              >
                Listed On
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.55rem', // Further reduced font size
                  fontWeight: 500,
                  color: '#888',
                  display: 'block',
                  lineHeight: 1.1
                }}
              >
                {new Date(product.listedDate).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          {/* Location Row */}
          <Box sx={{ mb: 0.8 }}>
            {product.harvestDetails?.location && (
              <Chip 
                icon={<LocationOnIcon sx={{ fontSize: '12px' }} />} 
                label={product.harvestDetails.location} 
                size="small" 
                sx={{ 
                  fontSize: '0.6rem', // Further reduced font size
                  height: '18px', // Further reduced height
                  maxWidth: '120px',
                  backgroundColor: '#e8f5e8',
                  color: '#2e7d32',
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    px: 0.6
                  },
                  '& .MuiChip-icon': {
                    color: '#2e7d32'
                  }
                }}
              />
            )}
          </Box>

          {/* Stock Information */}
          <Box sx={{ mb: 0.8 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: '600',
                fontSize: '0.7rem', // Further reduced font size
                lineHeight: 1.2,
                color: product.quantity <= 0 ? "#d32f2f" : product.quantity <= 10 ? "#f57c00" : "#2e7d32"
              }}
            >
              Stock: {product.quantity} kg
            </Typography>
            {product.quantity <= 10 && product.quantity > 0 && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: "#f57c00",
                  fontSize: '0.55rem', // Further reduced font size
                  fontWeight: 500,
                  lineHeight: 1.1,
                  display: 'block'
                }}
              >
                Low Stock Warning
              </Typography>
            )}
            {product.quantity <= 0 && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: "#d32f2f",
                  fontSize: '0.55rem', // Further reduced font size
                  fontWeight: 500,
                  lineHeight: 1.1,
                  display: 'block'
                }}
              >
                Currently Unavailable
              </Typography>
            )}
          </Box>
          
          {/* Price Section */}
          <Box sx={{ mt: 'auto', pt: 0.6, borderTop: '1px solid #f0f0f0' }}>
            <Typography 
              variant="h5" 
              color="primary.main" 
              fontWeight="700"
              sx={{ 
                fontSize: '1rem', // Further reduced font size
                lineHeight: 1.1,
                color: '#1976d2'
              }}
            >
              Rs. {product.price}
              <Typography 
                component="span" 
                sx={{ 
                  fontSize: '0.6rem', // Further reduced font size
                  fontWeight: 400,
                  color: 'text.secondary',
                  ml: 0.5
                }}
              >
                per kg
              </Typography>
            </Typography>
          </Box>
        </CardContent>

        {/* Action Buttons - Using Box for better control */}
        <Box sx={{ 
          p: 1, 
          pt: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          width: '100%'
        }}>
          <Button
            variant="contained"
            disabled={product.quantity <= 0}
            onClick={() => handleAddToCart(product)}
            startIcon={<ShoppingCartIcon />}
            sx={{
              width: '100%',
              borderRadius: 2,
              fontWeight: "600",
              textTransform: 'none',
              height: 30, // Further reduced button height
              fontSize: '0.7rem', // Further reduced font size
              backgroundColor: product.quantity <= 0 ? '#e0e0e0' : '#f9c80e',
              color: product.quantity <= 0 ? '#9e9e9e' : '#333',
              boxShadow: product.quantity <= 0 ? 'none' : '0 2px 8px rgba(249, 200, 14, 0.3)',
              '&:hover': {
                backgroundColor: product.quantity <= 0 ? '#e0e0e0' : '#e6b800',
                color: product.quantity <= 0 ? '#9e9e9e' : '#333',
                boxShadow: product.quantity <= 0 ? 'none' : '0 4px 12px rgba(249, 200, 14, 0.4)'
              },
              '&:disabled': {
                backgroundColor: '#e0e0e0',
                color: '#9e9e9e'
              }
            }}
          >
            {product.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
          </Button>

          <Button
            variant="outlined"
            onClick={() => handleSeeMore(product)}
            sx={{
              width: '100%',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: '500',
              color: '#1976d2',
              borderColor: '#1976d2',
              height: 26, // Further reduced button height
              fontSize: '0.65rem', // Further reduced font size
              '&:hover': {
                backgroundColor: '#e3f2fd',
                borderColor: '#1565c0'
              }
            }}
          >
            View Details
          </Button>
        </Box>
      </Card>
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 2, px: { xs: 0 } }}>
      {/* Header Section */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{
            fontWeight: 'bold',
            color: '#e09f3e',
            mb: 1,
            display: 'flex',  
            alignItems: 'center',
            justifyContent: 'left',
            gap: 1
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 36, mr: 1 }} />
          Products
        </Typography>
      </Box>

      {/* Search and Filters Section */}
      <Paper elevation={2} sx={{ px: 1, py: 1, mb: 3, borderRadius: 2, bgcolor: '#fff' }}>
        {/* Filter Section Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#222',
            mb: 2,
            textAlign: 'left',
            letterSpacing: 0.5
          }}
        >
          Search &amp; Filter Products
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between' }}>
          <Box sx={{ flex: '1 1 180px', minWidth: 150, maxWidth: 300 }}>
            <TextField
              label="Search"
              placeholder="Product name..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#000' }} fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  height: 40,
                  '& fieldset': {
                    borderColor: '#000',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': { borderColor: '#222' },
                  '&.Mui-focused fieldset': { borderColor: '#222' }
                },
                '& .MuiInputLabel-outlined': {
                  color: '#000',
                  fontWeight: 600,
                  background: '#fff',
                  px: 0.5,
                  margin: 0
                }
              }}
            />
          </Box>
          <Box sx={{ flex: '1 1 180px', minWidth: 150, maxWidth: 300 }}>
            <Autocomplete
              value={districtFilter}
              onChange={(event, newValue) => setDistrictFilter(newValue || "All Districts")}
              options={districts}
              size="small"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="District"
                  placeholder="Select..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <LocationOnIcon sx={{ color: '#000' }} fontSize="small" />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      height: 40,
                      '& fieldset': {
                        borderColor: '#000',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': { borderColor: '#222' },
                      '&.Mui-focused fieldset': { borderColor: '#222' }
                    },
                    '& .MuiInputLabel-outlined': {
                      color: '#000',
                      fontWeight: 600,
                      background: '#fff',
                      px: 0.5,
                      margin: 0
                    }
                  }}
                />
              )}
              disableClearable
            />
          </Box>
          <Box sx={{ flex: '1 1 180px', minWidth: 150, maxWidth: 300 }}>
            <TextField
              label="Max Price"
              type="number"
              size="small"
              fullWidth
              placeholder="Enter amount..."
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon sx={{ color: '#000' }} fontSize="small" />
                  </InputAdornment>
                ),
              }}
              inputProps={{ min: 0 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  height: 40,
                  '& fieldset': {
                    borderColor: '#000',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': { borderColor: '#222' },
                  '&.Mui-focused fieldset': { borderColor: '#222' }
                },
                '& .MuiInputLabel-outlined': {
                  color: '#000',
                  fontWeight: 600,
                  background: '#fff',
                  px: 0.5,
                  margin: 0
                }
              }}
            />
          </Box>
          <Box sx={{ flex: '1 1 120px', minWidth: 120, maxWidth: 200, display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              fullWidth={false}
              onClick={() => {
                setSearchQuery("");
                setDistrictFilter("All Districts");
                setMaxPrice("");
                setPage(1);
              }}
              sx={{
                height: 40,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'medium',
                backgroundColor: '#000',
                color: '#fff',
                boxShadow: 'none',
                width: '50%',
                minWidth: 60,
                maxWidth: 100,
                margin: '0 auto',
                '&:hover': {
                  backgroundColor: '#222',
                  color: '#fff',
                  boxShadow: 'none',
                }
              }}
            >
              Clear
            </Button>
          </Box>
        </Box>

        {/* Active Filters */}
        {(searchQuery || districtFilter !== "All Districts" || maxPrice) && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {searchQuery && (
                <Chip
                  label={searchQuery}
                  onDelete={() => setSearchQuery("")}
                  size="small"
                  sx={{
                    borderColor: '#000', // black border
                    color: '#000',        // black text
                    backgroundColor: '#fff', // white background
                    fontWeight: 600
                  }}
                  variant="outlined"
                />
              )}
              {districtFilter !== "All Districts" && (
                <Chip
                  label={districtFilter}
                  onDelete={() => setDistrictFilter("All Districts")}
                  size="small"
                  sx={{
                    borderColor: '#000',
                    color: '#000',
                    backgroundColor: '#fff',
                    fontWeight: 600
                  }}
                  variant="outlined"
                />
              )}
              {maxPrice && (
                <Chip
                  label={`Max: Rs.${maxPrice}`}
                  onDelete={() => setMaxPrice("")}
                  size="small"
                  sx={{
                    borderColor: '#000',
                    color: '#000',
                    backgroundColor: '#fff',
                    fontWeight: 600
                  }}
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Results Count */}
      {(searchQuery || districtFilter !== "All Districts" || maxPrice) && (
        <Box sx={{ p: 1, mb: 2, textAlign: 'center', bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'info.contrastText' }}>
            {fetchedProducts.length} product(s) found
          </Typography>
        </Box>
      )}

      {/* Section Caption for Products Grid */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mb: 2, mt: 2 }}>
        <EmojiNatureIcon sx={{ color: '#43a047', fontSize: 32, mr: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#222' }}>
          Fresh Harvest Products
        </Typography>
      </Box>

      {loading ? (
        <Grid 
          container 
          rowSpacing={5}
          columnSpacing={7.9} // Match skeleton and card grid spacing
          sx={{ 
            width: '100%',
            margin: 0,
            padding: 0,
            justifyContent: 'flex-start',
            alignItems: 'stretch',
          }}
        >
          {Array.from(new Array(8)).map((_, i) => (
            <Grid item xs={12} sm={6} md={3} lg={3} xl={3} key={i} sx={{ display: 'flex', justifyContent: 'flex-start', p: 0 }}>
              <Card sx={{
                width: 220, // Same as real cards
                height: 320, // Same as real cards
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                m: '0 auto',
              }}>
                <Skeleton variant="rectangular" height={120} />
                <CardContent sx={{ flexGrow: 1, p: 1, pb: 0.5 }}>
                  {/* Product Name and Date Row Skeleton */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.4 }}>
                    <Skeleton variant="text" width="70%" height={18} />
                    <Box sx={{ textAlign: 'right', ml: 1 }}>
                      <Skeleton variant="text" width={24} height={7} sx={{ mb: 0.2 }} />
                      <Skeleton variant="text" width={32} height={9} />
                    </Box>
                  </Box>
                  {/* Location Skeleton */}
                  <Box sx={{ mb: 0.8 }}>
                    <Skeleton variant="rectangular" width={80} height={16} sx={{ borderRadius: 3 }} />
                  </Box>
                  <Skeleton variant="text" width="50%" height={12} sx={{ mb: 0.2 }} />
                  <Skeleton variant="text" width="30%" height={9} sx={{ mb: 0.8 }} />
                  <Box sx={{ mt: 'auto', pt: 0.6 }}>
                    <Skeleton variant="text" width="70%" height={16} />
                  </Box>
                </CardContent>
                <Box sx={{ p: 1, pt: 0, display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
                  <Skeleton variant="rectangular" width="100%" height={30} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="rectangular" width="100%" height={26} sx={{ borderRadius: 2 }} />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : fetchedProducts.length > 0 ? (
        <Box sx={{ px: 0 }}>
          <Grid 
            container 
            rowSpacing={5}
            columnSpacing={7.9} // Match skeleton and card grid spacing
            sx={{
              width: '100%',
              margin: 0,
              padding: 0,
              justifyContent: 'flex-start',
              alignItems: 'stretch',
            }}
          >
            {fetchedProducts.map(renderProductCard)}
          </Grid>
        </Box>
      ) : (
        <Box textAlign="center" py={8}>
          <Typography variant="h5" color="text.disabled" sx={{ mb: 1 }}>
            No Products Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria
          </Typography>
        </Box>
      )}

      {totalPages > 1 && (
        <Stack direction="row" justifyContent="center" alignItems="center" mt={4} spacing={2}>
          <Button 
            disabled={page === 1} 
            onClick={() => setPage(page - 1)} 
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            size="small"
          >
            Previous
          </Button>
          <Typography variant="body2" sx={{ mx: 2 }}>
            Page {page} of {totalPages}
          </Typography>
          <Button 
            disabled={page === totalPages} 
            onClick={() => setPage(page + 1)} 
            endIcon={<ArrowForwardIcon />}
            variant="outlined"
            size="small"
          >
            Next
          </Button>
        </Stack>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>

      {/* SEE MORE Dialog - Added this from your branch */}
      <Dialog open={seeMoreOpen} onClose={() => setSeeMoreOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Product Details
          <IconButton
            aria-label="close"
            onClick={() => setSeeMoreOpen(false)}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <>
              <Typography variant="h6" fontWeight={600}>
                {selectedProduct.name}
              </Typography>
              {selectedProduct.itemCode && (
                <Typography variant="body2" sx={{ mt: 1, color: 'primary.main', fontWeight: 500 }}>
                  <strong>Item Code:</strong> {selectedProduct.itemCode}
                </Typography>
              )}
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Price:</strong> Rs. {selectedProduct.price}
              </Typography>
              <Typography variant="body2">
                <strong>Quantity:</strong> {selectedProduct.quantity}
              </Typography>
              <Typography variant="body2">
                <strong>Description:</strong> {selectedProduct.description || "No description available"}
              </Typography>
              <Typography variant="body2">
                <strong>Harvest Location:</strong> {selectedProduct.harvestDetails?.location || "N/A"}
              </Typography>
              <Typography variant="body2">
                <strong>Listed Date:</strong> {new Date(selectedProduct.listedDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                <strong>Farmer:</strong> {loadingFarmer ? "Loading..." : farmerInfo?.name || "Unknown"}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Rating value={farmerInfo?.farmerRatings || 0} precision={0.1} readOnly size="large" />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {farmerInfo?.farmerRatings ? `${farmerInfo.farmerRatings.toFixed(1)} / 5` : "No ratings"}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions />
      </Dialog>
    </Container>
  );
};

export default BrowseListing;
