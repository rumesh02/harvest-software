import React, { useState, useEffect, useCallback } from "react";
import { Box, Container, Typography, TextField, Grid, Card, CardMedia, CardActions, Button, 
 InputAdornment, Stack, Autocomplete, Dialog, DialogTitle, DialogContent, IconButton, CircularProgress } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'; // Add this import for the price icon
import CloseIcon from '@mui/icons-material/Close';
import axios from "axios";
import { useCart } from "../../context/CartContext";
import Rating from "@mui/material/Rating";

const staticProducts = [];

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
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("All Districts");
  const [maxPrice, setMaxPrice] = useState(1000);
  const { addToCart } = useCart();
  const [seeMoreOpen, setSeeMoreOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [farmerInfo, setFarmerInfo] = useState(null);
  const [loadingFarmer, setLoadingFarmer] = useState(false);
  const [farmerRatings, setFarmerRatings] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setFetchedProducts(res.data);
      setFilteredProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Use useCallback to memoize the applyFilters function
  const applyFilters = useCallback(() => {
    let filtered = fetchedProducts;

    // Apply search filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply district filter
    if (districtFilter !== "All Districts") {
      filtered = filtered.filter(product => 
        product.harvestDetails?.location?.includes(districtFilter)
      );
    }

    // Apply price filter
    filtered = filtered.filter(product => 
      product.price <= maxPrice
    );

    setFilteredProducts(filtered);
  }, [searchQuery, districtFilter, maxPrice, fetchedProducts]);

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters(); // Call applyFilters whenever filter values change
  }, [searchQuery, districtFilter, maxPrice, fetchedProducts]); // Dependencies ensure filters are applied

  // Combine static products with dynamically filtered ones
  const allProducts = [
    ...staticProducts.filter(product => 
      searchQuery ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
    ), 
    ...filteredProducts
  ];

  const handleSeeMore = async (product) => {
    setSelectedProduct(product);
    setSeeMoreOpen(true);
    setLoadingFarmer(true);
    try {
      // Assuming product.farmerID is available and your backend has this endpoint:
      const res = await axios.get(`http://localhost:5000/api/users/${product.farmerID}`);
      setFarmerInfo(res.data);
    } catch (err) {
      setFarmerInfo({ name: "Unknown" });
    }
    setLoadingFarmer(false);
  };

  // Fetch farmer ratings after products are fetched
  useEffect(() => {
    const fetchRatings = async () => {
      const ratings = {};
      for (const product of fetchedProducts) {
        if (product.farmerID && !ratings[product.farmerID]) {
          try {
            const res = await axios.get(`http://localhost:5000/api/users/${product.farmerID}`);
            ratings[product.farmerID] = res.data.farmerRatings || 0;
          } catch {
            ratings[product.farmerID] = 0;
          }
        }
      }
      setFarmerRatings(ratings);
    };
    if (fetchedProducts.length > 0) fetchRatings();
  }, [fetchedProducts]);

  return (
    <Container sx={{ mt: 4 }}>
      {/* Header */}
      <Typography variant="h5" fontWeight={600} mb={2}>
        🛒 Items
      </Typography>

      {/* Search Bar and Filters */}
      <Box sx={{ background: "#FFEFD5", padding: "20px", borderRadius: "10px", mb: 3 }}>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} md={4}>
            <Typography variant="body2" fontWeight={500} mb={1}>
              <SearchIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Search Products
            </Typography>
            <TextField
              placeholder="Enter product name"
              variant="outlined"
              size="small"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ 
                background: "white", 
                borderRadius: "5px",
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#FFDBA4",
                  },
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
          
          <Grid item xs={12} md={4}>
            <Typography variant="body2" fontWeight={500} mb={1}>
              <LocationOnIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Filter by District
            </Typography>
            <Autocomplete
              value={districtFilter}
              onChange={(event, newValue) => {
                setDistrictFilter(newValue || "All Districts");
              }}
              options={districts}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select a district"
                  size="small"
                  sx={{ 
                    background: "white", 
                    borderRadius: "5px",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#FFDBA4",
                      },
                    }
                  }}
                />
              )}
              sx={{ width: "100%" }}
              disableClearable
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="body2" fontWeight={500} mb={1}>
              <AttachMoneyIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Max Price (Rs)
            </Typography>
            <TextField
              type="number"
              size="small"
              fullWidth
              placeholder="Enter maximum price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
              sx={{ 
                background: "white", 
                borderRadius: "5px",
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#FFDBA4",
                  },
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    Rs
                  </InputAdornment>
                ),
              }}
              inputProps={{ min: 0 }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Product Grid */}
      <Typography variant="h6" fontWeight={600} mt={3} mb={2}>
        Buy Fresh Harvest!
      </Typography>
      
      {allProducts.length > 0 ? (
        <Grid container spacing={2}>
          {allProducts.slice().reverse().map((product, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Card sx={{ borderRadius: "10px", overflow: "hidden", textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Box>
                  <CardMedia component="img" height="120" image={product.img || product.image} alt={product.name} />
                  <Typography variant="subtitle1" fontWeight={600} mt={1}>
                    {product.name}
                  </Typography>
                  {product.price && <Typography variant="body2">Rs. {product.price}</Typography>}
                  {product.quantity && <Typography variant="body2">Qty: {product.quantity}</Typography>}
                  {product.harvestDetails?.location && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Location: {product.harvestDetails.location}
                    </Typography>
                  )}
                  {product.listedDate && (
                    <Typography variant="caption" color="text.secondary">
                      Listed: {new Date(product.listedDate).toLocaleDateString()}
                    </Typography>
                  )}
                  {/* SEE MORE link moved here */}
                  <Typography
                    variant="body2"
                    sx={{ color: "blue", cursor: "pointer", textDecoration: "underline", mt: 1 }}
                    onClick={() => handleSeeMore(product)}
                  >
                    SEE MORE
                  </Typography>
                </Box>
                <CardActions>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      width: "100%",
                      backgroundColor: "#FFEFD5",
                      color: "#333",
                      "&:hover": {
                        backgroundColor: "#FFDBA4",
                      },
                    }}
                    onClick={() => {
                      addToCart({
                        ...product,
                        farmerID: product.farmerID
                      });
                    }}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          No products found matching your criteria
        </Typography>
      )}

      {/* See More Dialog */}
      <Dialog open={seeMoreOpen} onClose={() => setSeeMoreOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Product Details
          <IconButton
            aria-label="close"
            onClick={() => setSeeMoreOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedProduct && (
            <>
              <Typography variant="subtitle1" fontWeight={600}>
                {selectedProduct.name}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Farmer:</strong>{" "}
                {loadingFarmer ? <CircularProgress size={14} /> : (farmerInfo?.name || "Unknown")}
              </Typography>
              {/* Farmer Rating Box */}
              <Box sx={{ display: "flex", alignItems: "center", mt: 1, mb: 1 }}>
                <Rating
                  value={farmerInfo?.farmerRatings || 0}
                  precision={0.1}
                  readOnly
                  size="medium"
                />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  {farmerInfo?.farmerRatings
                    ? `${farmerInfo.farmerRatings.toFixed(1)} / 5`
                    : "No ratings"}
                </Typography>
              </Box>
              <Typography variant="body2">
                <strong>Listed Date:</strong> {selectedProduct.listedDate ? new Date(selectedProduct.listedDate).toLocaleDateString() : "N/A"}
              </Typography>
              <Typography variant="body2">
                <strong>Price:</strong> Rs. {selectedProduct.price}
              </Typography>
              <Typography variant="body2">
                <strong>Quantity:</strong> {selectedProduct.quantity}
              </Typography>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default BrowseListing;