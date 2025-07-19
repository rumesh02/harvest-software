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
  CardActions,
  Button,
  InputAdornment,
  Autocomplete,
  Skeleton,
  Snackbar,
  Paper,
  Chip,
  Stack,
  Divider,
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
      const params = new URLSearchParams({ page, limit: 9 });
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
    <Grid item xs={12} sm={6} md={4} lg={3} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
      <Card sx={{
        display: 'flex',
        flexDirection: 'column',
        width: 300, // Fixed width for all cards
        height: 520, // Increased height to accommodate both buttons properly
        borderRadius: 2,
        boxShadow: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}>
        <CardMedia
          component="img"
          image={product.img || product.image || "/images/placeholder.png"}
          alt={product.name}
          sx={{
            width: '100%',
            height: 200,
            objectFit: 'cover',
            backgroundColor: '#f5f5f5'
          }}
          onError={(e) => {
            e.target.src = "/images/placeholder.png"; // Fallback image
          }}
        />
        <CardContent sx={{ 
          flexGrow: 1, 
          display: "flex", 
          flexDirection: "column",
          p: 1.5, // Reduced padding
          height: 'calc(100% - 200px - 100px)' // Adjusted to account for two buttons with proper spacing
        }}>
          {/* Product name and Listed date in same row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 1, // Reduced to 1 line
                WebkitBoxOrient: 'vertical',
                minHeight: '1.5em', // Reduced height for 1 line
                lineHeight: '1.5em',
                flex: 1,
                mr: 1,
                textAlign: 'left' // Explicitly left align
              }}
            >
              {product.name}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                minHeight: '1em', // Reduced height for date
                flexShrink: 0,
                fontSize: '0.7rem',
                textAlign: 'right' // Explicitly right align
              }}
            >
              Listed Date: {new Date(product.listedDate).toLocaleDateString()}
            </Typography>
          </Box>
          
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ 
              mb: 1, // Reduced margin
              flexWrap: 'wrap', 
              gap: 0.5,
              minHeight: '28px' // Reduced height for chip container
            }}
          >
            {product.harvestDetails?.location && (
              <Chip 
                icon={<LocationOnIcon />} 
                label={product.harvestDetails.location} 
                size="small" 
                sx={{ 
                  fontSize: '0.75rem',
                  maxWidth: '130px',
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }
                }}
              />
            )}
          </Stack>
          
          {/* Available Stock - Bold and labeled */}
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 0.5,
              minHeight: '1.2em',
              fontWeight: 'bold',
              color: product.quantity <= 0 ? "error.main" : product.quantity <= 10 ? "warning.main" : "success.main"
            }}
          >
            Available Stock: {product.quantity} kg
          </Typography>
          
          <Divider sx={{ my: 0.5 }} /> {/* Reduced margin */}
          
          <Box sx={{ mt: 'auto' }}>
            <Typography 
              variant="h6" 
              color="primary.main" 
              fontWeight="bold"
              sx={{ mb: 0.5 }}
            >
              Rs. {product.price} <span style={{ fontSize: '0.8rem' }}>per kg</span>
            </Typography>
            
            {product.quantity <= 0 && (
              <Typography 
                variant="body2" 
                color="error.main" 
                fontWeight="bold"
                sx={{ minHeight: '1.2em' }} // Reduced height
              >
                Out of Stock
              </Typography>
            )}
            {product.quantity > 0 && product.quantity <= 10 && (
              <Typography 
                variant="body2" 
                color="warning.main" 
                fontWeight="bold"
                sx={{ minHeight: '1.2em' }} // Reduced height
              >
                Low Stock
              </Typography>
            )}
            {product.quantity > 10 && (
              <Box sx={{ minHeight: '1.2em' }} /> // Reduced height
            )}
          </Box>
        </CardContent>

        {/* Modified CardActions with both buttons */}
        <CardActions sx={{ p: 1.5, height: 100, flexDirection: "column", gap: 1, mt: 'auto' }}>
          <Button
            fullWidth
            variant="contained"
            disabled={product.quantity <= 0}
            onClick={() => handleAddToCart(product)}
            startIcon={<ShoppingCartIcon />}
            sx={{
              borderRadius: 2,
              fontWeight: "medium",
              textTransform: 'none',
              height: 40,
              backgroundColor: '#f9c80e',
              color: '#222',
              '&:hover': {
                backgroundColor: '#e6b800',
                color: '#222'
              }
            }}
          >
            {product.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
          </Button>

          {/* Add the See More button */}
          <Button
            fullWidth
            variant="outlined"
            onClick={() => handleSeeMore(product)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'medium',
              color: '#1976d2',
              borderColor: '#1976d2',
              height: 40,
              '&:hover': {
                backgroundColor: '#e3f2fd'
              }
            }}
          >
            See More
          </Button>
        </CardActions>
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
          spacing={3} 
          sx={{ 
            justifyContent: 'center',
            mx: 0, // Remove horizontal margin
            width: '100%'
          }}
        >
          {Array.from(new Array(9)).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={4} key={i} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card sx={{
                width: 300,
                height: 520, // Updated to match the actual card height
                borderRadius: 2,
                boxShadow: 2,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                  <Skeleton variant="text" width="80%" height={24} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="40%" height={16} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="50%" height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="70%" height={16} />
                </CardContent>
                <CardActions sx={{ p: 1.5, height: 100 }}>
                  <Skeleton variant="rectangular" width="100%" height={40} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" width="100%" height={40} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : fetchedProducts.length > 0 ? (
        <Box sx={{ px: 0 }}>
          <Grid 
            container 
            spacing={3}
            columns={{ xs: 4, sm: 8, md: 12 }}
            sx={{
              paddingLeft: 0,
              paddingRight: 0,
              marginLeft: 0,
              marginRight: 0,
              width: '100%',
              justifyContent: 'space-between', // Added to dynamically adjust horizontal spacing
            }}
          >
            {fetchedProducts.slice().reverse().map(renderProductCard)}
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
