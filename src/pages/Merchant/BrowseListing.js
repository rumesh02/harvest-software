import React, { useState, useEffect, useCallback } from "react";
import { Box, Container, Typography, TextField, Grid, Card, CardMedia, CardActions, Button, 
 InputAdornment, Autocomplete, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material"; // <-- Add Skeleton import
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CloseIcon from '@mui/icons-material/Close'; // Import CloseIcon
import axios from "axios";
import { useCart } from "../../context/CartContext";
import Rating from '@mui/material/Rating';
import { useNavigate } from "react-router-dom";

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
  const [maxPrice, setMaxPrice] = useState(1000);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const [seeMoreOpen, setSeeMoreOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [farmerInfo, setFarmerInfo] = useState(null);
  const [loadingFarmer, setLoadingFarmer] = useState(false);
  const [addMoreItemsOpen, setAddMoreItemsOpen] = useState(false);
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery.trim() !== "") params.search = searchQuery;
      if (districtFilter && districtFilter !== "All Districts") params.district = districtFilter;
      if (maxPrice) params.maxPrice = maxPrice;
      params.page = page;
      params.limit = 8;

      const res = await axios.get("http://localhost:5000/api/products", { params });
      setFetchedProducts(res.data.products);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, districtFilter, maxPrice, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchFarmerInfo = async (farmerID) => {
    try {
      setLoadingFarmer(true);
      const res = await axios.get(`http://localhost:5000/api/users/${farmerID}`);
      console.log("Farmer Info:", res.data); // Debugging log
      setFarmerInfo(res.data);
    } catch (err) {
      console.error("Error fetching farmer info:", err);
      setFarmerInfo(null);
    } finally {
      setLoadingFarmer(false);
    }
  };

  // Function to get location display with farmer fallback
  const getLocationDisplay = (product, farmer) => {
    // First priority: Product's specific location (selected during listing)
    if (product.location?.address) {
      return product.location.address;
    }
    
    // Second priority: Harvest details location
    if (product.harvestDetails?.location) {
      return product.harvestDetails.location;
    }
    
    // Final fallback: Farmer's registered address + district
    if (farmer && farmer.address && farmer.district) {
      return `${farmer.address}, ${farmer.district}`;
    }
    
    // If farmer has only address
    if (farmer && farmer.address) {
      return farmer.address;
    }
    
    // If farmer has only district
    if (farmer && farmer.district) {
      return farmer.district;
    }
    
    // If no location data is available
    return 'Location not available';
  };

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      farmerID: product.farmerID,
    });
    setAddMoreItemsOpen(true);
  };

  const handleYesAddMore = () => {
    setAddMoreItemsOpen(false);
    // Stay in current tab (BrowseListing)
  };

  const handleNoRedirect = () => {
    setAddMoreItemsOpen(false);
    // Redirect to PlaceBids tab
    navigate("/merchant/buy");
  };

  const allProducts = fetchedProducts;

  return (
    <Container sx={{ mt: 4 }}>
      {/* Header */}
      <Typography variant="h5" fontWeight={600} mb={2} sx={{ color: "#6D4C41" }}>
        🛒 Items
      </Typography>

      {/* Search Bar and Filters */}
      <Box sx={{ background: "#FFF8E1", padding: "20px", borderRadius: "10px", mb: 3 }}>
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
      <Typography variant="h6" fontWeight={600} mt={3} mb={2} sx={{ color: "#FFA000" }}>
        Buy Fresh Harvest!
      </Typography>
      
      {loading ? (
        <Grid container spacing={2}>
          {[...Array(8)].map((_, idx) => (
            <Grid item xs={6} sm={4} md={3} key={idx}>
              <Card sx={{ borderRadius: "10px", overflow: "hidden", textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Skeleton variant="rectangular" height={120} />
                <Box sx={{ p: 2 }}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="50%" />
                </Box>
                <CardActions>
                  <Skeleton variant="rectangular" width="100%" height={36} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : allProducts.length > 0 ? (
        <Grid container spacing={2}>
          {allProducts.slice().reverse().map((product, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Card sx={{ borderRadius: "10px", overflow: "hidden", textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#FFFDE7", border: "1px solid #FFE082" }}>
                <Box>
                  <CardMedia component="img" height="120" image={product.img || product.image} alt={product.name} />
                  <Typography variant="subtitle1" fontWeight={600} mt={1}>
                    {product.name}
                  </Typography>
                  {product.itemCode && (
                    <Typography variant="caption" color="primary" fontWeight={500}>
                      Code: {product.itemCode}
                    </Typography>
                  )}
                  {product.price && <Typography variant="body2">Rs. {product.price}</Typography>}
                  {product.quantity && <Typography variant="body2">Qty: {product.quantity}</Typography>}
                  {product.listedDate && (
                    <Typography variant="caption" color="text.secondary">
                      Listed: {new Date(product.listedDate).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
                <CardActions sx={{ flexDirection: "column", gap: 1 }}>
                  <Button
                    variant="text"
                    size="small"
                    sx={{
                      width: "100%",
                      color: "#FFA000",
                      textTransform: "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                    onClick={() => {
                      setSelectedProduct(product);
                      setSeeMoreOpen(true);
                      fetchFarmerInfo(product.farmerID);
                    }}
                  >
                    SEE MORE
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      width: "100%",
                      backgroundColor: "#FFC107", // Amber
                      color: "#333",
                      "&:hover": {
                        backgroundColor: "#FFA000", // Dark Amber
                      },
                    }}
                    onClick={() => handleAddToCart(product)}
                  >
                    ADD TO CART
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

      {/* Pagination Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          sx={{
            borderColor: "#FFC107",
            color: "#FFA000",
            "&:hover": {
              borderColor: "#FFA000",
              backgroundColor: "#FFF8E1",
            },
            mr: 2,
          }}
        >
          Previous
        </Button>
        <Typography variant="body1" sx={{ mx: 2, alignSelf: 'center' }}>
          Page {page} of {totalPages}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </Box>

      {/* Popup Dialog */}
      <Dialog open={seeMoreOpen} onClose={() => setSeeMoreOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Product Details
          <IconButton
            aria-label="close"
            onClick={() => setSeeMoreOpen(false)}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
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
                <strong>Harvest Location:</strong> {getLocationDisplay(selectedProduct, farmerInfo)}
              </Typography>

              <Typography variant="body2">
                <strong>Listed Date:</strong> {new Date(selectedProduct.listedDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                <strong>Farmer:</strong> {loadingFarmer ? "Loading..." : farmerInfo?.name || "Unknown"}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Rating
                  value={farmerInfo?.farmerRatings || 0}
                  precision={0.1}
                  readOnly
                  size="large"
                />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {farmerInfo?.farmerRatings
                    ? `${farmerInfo.farmerRatings.toFixed(1)} / 5`
                    : "No ratings"}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          
        </DialogActions>
      </Dialog>

      {/* Add More Items Popup Dialog */}
      <Dialog 
        open={addMoreItemsOpen} 
        onClose={() => setAddMoreItemsOpen(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2,
            textAlign: 'center'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600, 
          color: "#D97706", 
          fontSize: "1.2rem",
          pb: 1
        }}>
          Item Added to Cart!
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Would you like to add more items to your cart?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'center', 
          gap: 2,
          pb: 2
        }}>
          <Button
            variant="contained"
            onClick={handleYesAddMore}
            sx={{
              backgroundColor: "#4CAF50",
              color: "white",
              fontWeight: 600,
              px: 3,
              "&:hover": {
                backgroundColor: "#45a049"
              }
            }}
          >
            Yes
          </Button>
          <Button
            variant="contained"
            onClick={handleNoRedirect}
            sx={{
              backgroundColor: "#f44336",
              color: "white",
              fontWeight: 600,
              px: 3,
              "&:hover": {
                backgroundColor: "#d32f2f"
              }
            }}
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BrowseListing;