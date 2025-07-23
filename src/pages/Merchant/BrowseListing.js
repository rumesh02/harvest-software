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
  Rating,
  CircularProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import {
  setupProductUpdateListeners,
  joinUserRoom,
  disconnectSocket,
} from "../../socket";

const BrowseListing = () => {
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("All Districts");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Add these states for See More functionality
  const [seeMoreOpen, setSeeMoreOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [farmerInfo, setFarmerInfo] = useState(null);
  const [loadingFarmer, setLoadingFarmer] = useState(false);
  const [districts, setDistricts] = useState(["All Districts"]);
  const [productTypes, setProductTypes] = useState(["All Types"]);

  // Enhanced search states
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [popularTerms, setPopularTerms] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [searchPerformance, setSearchPerformance] = useState(null);

  // Progressive filtering states
  const [filteredDistricts, setFilteredDistricts] = useState(["All Districts"]);
  const [filteredTypes, setFilteredTypes] = useState(["All Types"]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000, avg: 0 });
  const [isFiltering, setIsFiltering] = useState(false);

  // Progressive filtering functions
  const updateFilteredOptions = useCallback(async () => {
    if (isFiltering) return; // Prevent concurrent updates
    
    setIsFiltering(true);
    try {
      // Build current filter params (excluding the filter being updated)
      const getCurrentFilters = (exclude = []) => {
        const params = new URLSearchParams();
        if (!exclude.includes('search') && searchQuery.trim()) {
          params.append('search', searchQuery.trim());
        }
        if (!exclude.includes('type') && typeFilter !== "All Types") {
          params.append('type', typeFilter);
        }
        if (!exclude.includes('district') && districtFilter !== "All Districts") {
          params.append('district', districtFilter);
        }
        if (!exclude.includes('maxPrice') && maxPrice && maxPrice > 0) {
          params.append('maxPrice', maxPrice);
        }
        return params;
      };

      // Update available districts based on other filters
      const districtParams = getCurrentFilters(['district']);
      const districtResponse = await axios.get(`http://localhost:5000/api/products/filter/districts?${districtParams}`);
      const availableDistricts = (districtResponse.data || [])
        .filter(d => d.district && d.district.trim())
        .map(d => d.district);
      setFilteredDistricts(["All Districts", ...availableDistricts]);

      // Update available types based on other filters
      const typeParams = getCurrentFilters(['type']);
      const typeResponse = await axios.get(`http://localhost:5000/api/products/filter/types?${typeParams}`);
      const availableTypes = (typeResponse.data || [])
        .filter(t => t.type && t.type.trim())
        .map(t => t.type);
      setFilteredTypes(["All Types", ...availableTypes]);

      // Update price range based on other filters
      const priceParams = getCurrentFilters(['maxPrice']);
      const priceResponse = await axios.get(`http://localhost:5000/api/products/filter/price-range?${priceParams}`);
      if (priceResponse.data && priceResponse.data.maxPrice > 0) {
        setPriceRange({
          min: priceResponse.data.minPrice || 0,
          max: priceResponse.data.maxPrice || 1000,
          avg: priceResponse.data.avgPrice || 0
        });
      }

    } catch (error) {
      console.error("Error updating filtered options:", error);
      // Fallback to default options if API fails
      setFilteredDistricts(districts);
      setFilteredTypes(productTypes);
    } finally {
      setIsFiltering(false);
    }
  }, [searchQuery, typeFilter, districtFilter, maxPrice, districts, productTypes, isFiltering]);

  // Update filtered options when any filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilteredOptions();
    }, 300); // Debounce to avoid too many API calls

    return () => clearTimeout(timeoutId);
  }, [searchQuery, typeFilter, districtFilter, maxPrice, updateFilteredOptions]);

  // Fetch search suggestions with progressive filtering
  const fetchFilteredSearchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    try {
      setSearchLoading(true);
      const params = new URLSearchParams({ search: query });
      
      // Add current filters to get contextual suggestions
      if (typeFilter !== "All Types") {
        params.append('type', typeFilter);
      }
      if (districtFilter !== "All Districts") {
        params.append('district', districtFilter);
      }
      if (maxPrice && maxPrice > 0) {
        params.append('maxPrice', maxPrice);
      }

      const response = await axios.get(`http://localhost:5000/api/products/filter/names?${params}`);
      const suggestions = (response.data || [])
        .filter(item => item.name && item.name.trim())
        .map(item => item.name)
        .slice(0, 10); // Limit suggestions
      
      setSearchSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching filtered search suggestions:", error);
      setSearchSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  }, [typeFilter, districtFilter, maxPrice]);

  // Fetch available districts and product types on component mount
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products/districts");
        const availableDistricts = (response.data || []).filter(district => district != null && district !== "");
        setDistricts(["All Districts", ...availableDistricts]);
      } catch (error) {
        console.error("Error fetching districts:", error);
        // Fallback to hardcoded districts if API fails
        setDistricts([
          "All Districts", "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", 
          "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", 
          "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", 
          "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", 
          "Monaragala", "Ratnapura", "Kegalle"
        ]);
      }
    };

    const fetchProductTypes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products/types");
        const availableTypes = (response.data || []).filter(type => type != null && type !== "");
        setProductTypes(["All Types", ...availableTypes]);
      } catch (error) {
        console.error("Error fetching product types:", error);
        // Fallback to common product types
        setProductTypes(["All Types", "Fruit", "Vegetable", "Grain", "Spice", "Herb"]);
      }
    };

    const fetchPopularTerms = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products/search/popular");
        // Filter out null/undefined values and ensure proper structure
        const terms = (response.data || []).filter(term => 
          term != null && 
          (typeof term === 'string' || (term.term && typeof term.term === 'string'))
        );
        setPopularTerms(terms);
      } catch (error) {
        console.error("Error fetching popular terms:", error);
        setPopularTerms([]);
      }
    };

    fetchDistricts();
    fetchProductTypes();
    fetchPopularTerms();
  }, []);

  // Debounced search suggestions with progressive filtering
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchFilteredSearchSuggestions(searchQuery.trim());
      } else {
        setSearchSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchFilteredSearchSuggestions]);

  const updateProductInList = useCallback((productId, updatedProduct) => {
    setFetchedProducts(prev => prev.map(p => (p._id === productId ? { ...p, ...updatedProduct } : p)));
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const startTime = performance.now();
      
      const params = new URLSearchParams({ page, limit: 8, sort: 'desc', sortBy: 'listedDate' });
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (districtFilter !== "All Districts") params.append("district", districtFilter);
      if (typeFilter !== "All Types") params.append("type", typeFilter);
      if (maxPrice && maxPrice > 0) params.append("maxPrice", maxPrice);

      const res = await axios.get(`http://localhost:5000/api/products?${params}`);
      const endTime = performance.now();
      
      if (res.data?.products) {
        setFetchedProducts(res.data.products);
        setTotalPages(res.data.totalPages || 1);
        setTotalResults(res.data.total || 0);
        
        // Track search performance
        setSearchPerformance({
          searchTime: (endTime - startTime).toFixed(2),
          resultCount: res.data.total || 0,
          isTextSearch: res.data.isTextSearch || false,
          searchTerm: res.data.searchTerm,
          filterType: res.data.filterType
        });
      } else {
        setFetchedProducts([]);
        setTotalPages(1);
        setTotalResults(0);
        setSearchPerformance(null);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setFetchedProducts([]);
      setTotalResults(0);
      setSearchPerformance(null);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, districtFilter, typeFilter, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, districtFilter, typeFilter, maxPrice]);

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

  // Add the handleChatWithFarmer function
  const handleChatWithFarmer = () => {
    if (selectedProduct && selectedProduct.farmerID) {
      // Close the product details dialog first
      setSeeMoreOpen(false);
      
      // Navigate to merchant messages page with chatWith parameter
      navigate(`/merchant/messages?chatWith=${selectedProduct.farmerID}`);
    }
  };

  const renderProductCard = (product, index) => (
    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3, xl: 3 }} key={index} sx={{ display: 'flex', justifyContent: 'flex-start', p: 0 }}>
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
          <Box sx={{ flex: '1 1 180px', minWidth: 150, maxWidth: 300, position: 'relative' }}>
            <Autocomplete
              value={typeFilter}
              onChange={(event, newValue) => setTypeFilter(newValue || "All Types")}
              options={filteredTypes.filter(type => type != null && type !== "")}
              size="small"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Product Type"
                  placeholder="Select type..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <EmojiNatureIcon sx={{ color: '#000' }} fontSize="small" />
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
              renderOption={(props, option) => {
                // Check if this option is in popularTerms to show with special styling
                const termText = typeof option === 'string' ? option : option?.term;
                const isPopular = popularTerms.some(term => {
                  const popularTermText = typeof term === 'string' ? term : term?.term;
                  return popularTermText === termText;
                });

                if (isPopular && option !== "All Types") {
                  // Get color scheme for popular terms
                  const getTypeColor = (type) => {
                    const lowerType = type.toLowerCase();
                    if (lowerType.includes('vegetable') || lowerType.includes('herb') || lowerType.includes('leafy')) {
                      return { icon: '🥬', color: '#2e7d32' };
                    } else if (lowerType.includes('fruit') || lowerType.includes('berry')) {
                      return { icon: '🍎', color: '#f57c00' };
                    } else if (lowerType.includes('grain') || lowerType.includes('cereal') || lowerType.includes('rice')) {
                      return { icon: '🌾', color: '#7b1fa2' };
                    } else if (lowerType.includes('spice') || lowerType.includes('seasoning')) {
                      return { icon: '🌶️', color: '#c2185b' };
                    } else {
                      return { icon: '🌱', color: '#616161' };
                    }
                  };

                  const colors = getTypeColor(termText);

                  return (
                    <li {...props} style={{ ...props.style, padding: '8px 12px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <span style={{ fontSize: '16px' }}>{colors.icon}</span>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: colors.color, 
                            fontWeight: 600,
                            flex: 1
                          }}
                        >
                          {option}
                        </Typography>
                        <Chip
                          label="Popular"
                          size="small"
                          sx={{
                            fontSize: '10px',
                            height: 20,
                            backgroundColor: colors.color + '20',
                            color: colors.color,
                            fontWeight: 500,
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                      </Box>
                    </li>
                  );
                }

                // Regular option styling
                return (
                  <li {...props} style={{ ...props.style, padding: '8px 12px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmojiNatureIcon sx={{ color: '#666', fontSize: 16 }} />
                      <Typography variant="body2" sx={{ color: '#333' }}>
                        {option}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
              disableClearable
            />
          </Box>
          <Box sx={{ flex: '1 1 180px', minWidth: 150, maxWidth: 300 }}>
            <Autocomplete
              freeSolo
              value={searchQuery}
              onChange={(event, newValue) => {
                setSearchQuery(newValue || "");
                setShowSuggestions(false);
              }}
              onInputChange={(event, newInputValue) => {
                setSearchQuery(newInputValue);
              }}
              options={searchSuggestions.filter(item => item != null && item !== "")}
              size="small"
              loading={searchLoading}
              open={showSuggestions && searchSuggestions.length > 0}
              onOpen={() => setShowSuggestions(true)}
              onClose={() => setShowSuggestions(false)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Products"
                  placeholder="Enter product name..."
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#000' }} fontSize="small" />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {searchLoading && <CircularProgress color="inherit" size={20} />}
                        {params.InputProps.endAdornment}
                      </>
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
              )}
              renderOption={(props, option) => {
                // Safety check for null or undefined options
                if (!option) return null;
                return (
                  <li {...props}>
                    <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                    {option}
                  </li>
                );
              }}
            />
          </Box>
          <Box sx={{ flex: '1 1 180px', minWidth: 150, maxWidth: 300 }}>
            <Autocomplete
              value={districtFilter}
              onChange={(event, newValue) => setDistrictFilter(newValue || "All Districts")}
              options={filteredDistricts.filter(district => district != null && district !== "")}
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
                    <MonetizationOnIcon sx={{ color: '#000' }} fontSize="small" />
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
          <Box sx={{ flex: '1 1 120px', minWidth: 120, maxWidth: 200, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              fullWidth={false}
              onClick={() => {
                setSearchQuery("");
                setDistrictFilter("All Districts");
                setTypeFilter("All Types");
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
                width: '70%',
                minWidth: 80,
                maxWidth: 120,
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
        {(searchQuery || districtFilter !== "All Districts" || typeFilter !== "All Types" || maxPrice) && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {searchQuery && (
                <Chip
                  label={`Search: "${searchQuery}"`}
                  onDelete={() => setSearchQuery("")}
                  size="small"
                  sx={{
                    borderColor: '#000',
                    color: '#000',
                    backgroundColor: '#fff',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                />
              )}
              {districtFilter !== "All Districts" && (
                <Chip
                  label={`District: ${districtFilter}`}
                  onDelete={() => setDistrictFilter("All Districts")}
                  size="small"
                  sx={{
                    borderColor: '#000',
                    color: '#000',
                    backgroundColor: '#fff',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                />
              )}
              {typeFilter !== "All Types" && (
                <Chip
                  label={`Type: ${typeFilter}`}
                  onDelete={() => setTypeFilter("All Types")}
                  size="small"
                  sx={{
                    borderColor: '#000',
                    color: '#000',
                    backgroundColor: '#fff',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                />
              )}
              {maxPrice && (
                <Chip
                  label={`Max Price: Rs. ${maxPrice}`}
                  onDelete={() => setMaxPrice("")}
                  size="small"
                  sx={{
                    borderColor: '#000',
                    color: '#000',
                    backgroundColor: '#fff',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                />
              )}
            </Stack>
          </Box>
        )}

        {/* Search Results Summary */}
        {(searchQuery || districtFilter !== "All Districts" || typeFilter !== "All Types" || maxPrice) && !loading && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
              <Typography variant="body2" color="text.secondary">
                Found <strong>{totalResults}</strong> products
                {searchQuery && ` for "${searchQuery}"`}
                {typeFilter !== "All Types" && ` of type "${typeFilter}"`}
                {districtFilter !== "All Districts" && ` in ${districtFilter}`}
                {maxPrice && ` under Rs. ${maxPrice}`}
              </Typography>
              {searchPerformance && (
                <Typography variant="caption" color="text.secondary">
                  Search completed in {searchPerformance.searchTime}ms
                  {searchPerformance.isTextSearch && " (Smart Search)"}
                </Typography>
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
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#43a047' }}>
          Fresh Harvest
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
            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3, xl: 3 }} key={i} sx={{ display: 'flex', justifyContent: 'flex-start', p: 0 }}>
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
                <strong>Harvest Location:</strong> {
                  selectedProduct.harvestDetails?.location || 
                  (farmerInfo?.address && farmerInfo?.district ? 
                    `${farmerInfo.address}, ${farmerInfo.district}` : 
                    farmerInfo?.address || 
                    farmerInfo?.district || 
                    "Location not available")
                }
              </Typography>
              <Typography variant="body2">
                <strong>Listed Date:</strong> {new Date(selectedProduct.listedDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                <strong>Farmer:</strong> {loadingFarmer ? "Loading..." : farmerInfo?.name || "Unknown"}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Rating value={farmerInfo?.farmerRating || 0} precision={0.1} readOnly size="large" />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {farmerInfo?.farmerRating ? `${farmerInfo.farmerRating.toFixed(1)} / 5` : "No ratings"}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleChatWithFarmer}
            startIcon={<ChatIcon />}
            disabled={!selectedProduct?.farmerID}
            sx={{
              backgroundColor: '#2E7D32',
              '&:hover': {
                backgroundColor: '#1B5E20'
              },
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Chat with Farmer
          </Button>
          <Button
            variant="outlined"
            onClick={() => setSeeMoreOpen(false)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BrowseListing;