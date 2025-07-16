import React, { useEffect, useState } from "react";
import { getVehicles, createBooking } from "../services/api";
import placeholderImage from "../assets/lorry.jpg";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton,
} from "@mui/material";
import LocateMe from "../components/LocateMe"; // Import LocateMe component

const allDistricts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
  "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee"
];

const FindVehicles = ({ selectedOrders }) => {
  // Debug logging to see what's in selectedOrders
  console.log("FindVehicles - selectedOrders:", selectedOrders);
  
  // selectedOrders contains confirmed bids from Collection page
  // Use the first selected order to get the confirmed bid details
  const selectedConfirmedBid = selectedOrders && selectedOrders.length > 0 ? selectedOrders[0] : null;
  
  console.log("FindVehicles - selectedConfirmedBid:", selectedConfirmedBid);
  console.log("FindVehicles - selectedConfirmedBid.bidId:", selectedConfirmedBid?.bidId);
  console.log("FindVehicles - selectedConfirmedBid.farmerId:", selectedConfirmedBid?.farmerId);
  console.log("FindVehicles - selectedConfirmedBid.items:", selectedConfirmedBid?.items);
  console.log("FindVehicles - selectedConfirmedBid.productLocation:", selectedConfirmedBid?.productLocation);
  
  // const { isLoaded } = useGoogleMaps();
  const [productDetails, setProductDetails] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  
  // Show loading state in the UI
  const isLoadingLocation = loadingProduct && !productDetails;
  
  // Fetch product details to get location information
  useEffect(() => {
    const fetchProductDetails = async () => {
      // First, check if the confirmed bid already has location information
      if (selectedConfirmedBid?.productLocation) {
        console.log("Using location from confirmed bid:", selectedConfirmedBid.productLocation);
        setProductDetails({
          location: selectedConfirmedBid.productLocation
        });
        setLoadingProduct(false);
        return;
      }
      
      // If not, try to fetch from product details
      if (selectedConfirmedBid?.items && selectedConfirmedBid.items.length > 0) {
        const productId = selectedConfirmedBid.items[0].productId;
        if (productId) {
          setLoadingProduct(true);
          try {
            const response = await axios.get(`http://localhost:5000/api/products/${productId}`);
            setProductDetails(response.data);
            console.log("Product details fetched:", response.data);
          } catch (error) {
            console.error("Error fetching product details:", error);
            console.error("Product ID not found:", productId);
            
            // Try to get location information from the original bid
            if (selectedConfirmedBid.bidId) {
              try {
                const bidResponse = await axios.get(`http://localhost:5000/api/bids/${selectedConfirmedBid.bidId}`);
                console.log("Bid details:", bidResponse.data);
                // If bid has location info, use it
                if (bidResponse.data.location) {
                  setProductDetails({
                    location: bidResponse.data.location
                  });
                  return;
                }
              } catch (bidError) {
                console.error("Error fetching bid details:", bidError);
              }
            }
            
            // Try to get farmer's location as fallback
            if (selectedConfirmedBid.farmerId) {
              try {
                const farmerResponse = await axios.get(`http://localhost:5000/api/users/${selectedConfirmedBid.farmerId}`);
                if (farmerResponse.data.location) {
                  setProductDetails({
                    location: farmerResponse.data.location
                  });
                  return;
                }
              } catch (farmerError) {
                console.error("Error fetching farmer details:", farmerError);
              }
            }
            
            // Final fallback
            setProductDetails({
              location: {
                address: "Harvest location not available (Product details not found)"
              }
            });
          } finally {
            setLoadingProduct(false);
          }
        }
      }
    };
    
    fetchProductDetails();
  }, [selectedConfirmedBid]);
  
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [capacityFilter, setCapacityFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [openLocationModal, setOpenLocationModal] = useState(false); // Add location modal state
  const [selectedLocationData, setSelectedLocationData] = useState(null); // Track selected location

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    phone: "",
    startLocation: "", // Will be populated from product details
    endLocation: "", // Keep this empty - don't auto-fill
    items: selectedConfirmedBid?.items?.[0]?.name || "",
    weight: selectedConfirmedBid?.items?.[0]?.quantity || "",
    itemCode: selectedConfirmedBid?.itemCode || selectedConfirmedBid?.items?.[0]?.itemCode || "",
  });
  
  // Update booking form when product details are loaded
  useEffect(() => {
    // First check if we have location data directly from confirmed bid
    if (selectedConfirmedBid?.productLocation) {
      setBookingForm(prev => ({
        ...prev,
        startLocation: selectedConfirmedBid.productLocation.address || "Harvest location not available",
        items: selectedConfirmedBid?.items?.[0]?.name || prev.items,
        weight: selectedConfirmedBid?.items?.[0]?.quantity || prev.weight,
        itemCode: selectedConfirmedBid?.itemCode || selectedConfirmedBid?.items?.[0]?.itemCode || prev.itemCode,
      }));
    } else if (productDetails && productDetails.location) {
      setBookingForm(prev => ({
        ...prev,
        startLocation: productDetails.location.address || "Harvest location not available",
        items: productDetails.name || selectedConfirmedBid?.items?.[0]?.name || prev.items,
        weight: selectedConfirmedBid?.items?.[0]?.quantity || prev.weight,
        itemCode: selectedConfirmedBid?.itemCode || selectedConfirmedBid?.items?.[0]?.itemCode || prev.itemCode,
      }));
    }
  }, [productDetails, selectedConfirmedBid]);

  // Map modal state
  const DEFAULT_MAP_CENTER = { lat: 6.9271, lng: 79.8612 }; // Default location (Colombo)
  const [currentLocation] = useState(DEFAULT_MAP_CENTER); // Default location (Colombo)

  const capacityRanges = [
    { label: "All Capacities", value: "" },
    { label: "Below 5000", value: "below5000" },
    { label: "5000 - 10000", value: "5000to10000" },
    { label: "Above 10000", value: "above10000" },
  ];

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await getVehicles();
        setVehicles(data);
      } catch (err) {
        setError("Failed to load vehicles");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Filter vehicles by selected capacity and district
  const filteredVehicles = vehicles.filter((v) => {
    const cap = parseInt(v.loadCapacity, 10);
    const matchesCapacity =
      !capacityFilter ||
      (capacityFilter === "below5000" && cap < 5000) ||
      (capacityFilter === "5000to10000" && cap >= 5000 && cap <= 10000) ||
      (capacityFilter === "above10000" && cap > 10000);

    const matchesDistrict =
      !districtFilter || v.district === districtFilter;

    return matchesCapacity && matchesDistrict;
  });

  // Handle opening the booking modal
  const handleBook = (vehicle) => {
    console.log("Selected Vehicle:", vehicle); // Debugging log
    setSelectedVehicle(vehicle);
    setBookingForm((prev) => ({
      ...prev,
      items: productDetails?.name || selectedConfirmedBid?.items?.[0]?.name || prev.items,
      weight: selectedConfirmedBid?.items?.[0]?.quantity || prev.weight,
      itemCode: selectedConfirmedBid?.itemCode || selectedConfirmedBid?.items?.[0]?.itemCode || prev.itemCode,
      startLocation: productDetails?.location?.address || "Harvest location not available", // Use product location
      endLocation: "", // Don't auto-fill end location
    }));
    setOpenModal(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedVehicle(null);
    setBookingForm({
      phone: "",
      startLocation: productDetails?.location?.address || "Location not available", // Use product location
      endLocation: "", // Reset to empty
      items: productDetails?.name || selectedConfirmedBid?.items?.[0]?.name || "",
      weight: selectedConfirmedBid?.items?.[0]?.quantity || "",
      itemCode: selectedConfirmedBid?.itemCode || selectedConfirmedBid?.items?.[0]?.itemCode || "",
    });
  };

  // Handle booking form field changes
  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle booking form submit
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !selectedVehicle._id ||
      !selectedVehicle.transporterId ||
      !bookingForm.phone ||
      !bookingForm.startLocation ||
      !bookingForm.endLocation ||
      !bookingForm.items ||
      !bookingForm.weight ||
      isNaN(Number(bookingForm.weight))
    ) {
      alert("Please fill all fields correctly.");
      return;
    }

    const bookingData = {
      vehicleId: selectedVehicle._id,
      transporterId: selectedVehicle.transporterId,
      merchantPhone: bookingForm.phone,
      startLocation: bookingForm.startLocation,
      endLocation: bookingForm.endLocation,
      items: bookingForm.items,
      weight: Number(bookingForm.weight),
      startLat: currentLocation.lat, // get from LocateMe or geocoding
      startLng: currentLocation.lng,
      endLat: currentLocation.lat,     // get from address autocomplete/geocoding
      endLng: currentLocation.lng,
    };

    try {
      await createBooking(bookingData);
      handleCloseModal();
    } catch (err) {
      alert("Booking failed: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  return (
    <Box sx={{ p: 3, background: "#f7fbff", minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: "left",
            mb: 1,
            fontWeight: 700,
            color: "#1a237e",
            letterSpacing: 1,
          }}
        >
          Find Vehicles
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
          <Typography sx={{ fontWeight: 500, color: "#333" }}>Capacity:</Typography>
          <FormControl
            size="small"
            sx={{
              minWidth: 180,
              background: "#fff",
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              displayEmpty
            >
              {capacityRanges.map((range) => (
                <MenuItem key={range.value} value={range.value}>
                  {range.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography sx={{ fontWeight: 500, color: "#333" }}>District:</Typography>
          <FormControl
            size="small"
            sx={{
              minWidth: 180,
              background: "#fff",
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">All Districts</MenuItem>
              {allDistricts.map((district) => (
                <MenuItem key={district} value={district}>
                  {district}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Grid
          container
          spacing={4}
          justifyContent="flex-start"
          sx={{ mt: 1 }}
        >
          {filteredVehicles.length === 0 ? (
            <Grid item xs={12}>
              <Typography>No vehicles available.</Typography>
            </Grid>
          ) : (
            filteredVehicles.map((vehicle) => (
              <Grid item key={vehicle._id} xs={12} sm={6} md={4} lg={3}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: "0 4px 24px rgba(60,72,88,0.10)",
                    p: 2,
                    minHeight: 320,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transition: "box-shadow 0.2s",
                    "&:hover": {
                      boxShadow: "0 8px 32px rgba(60,72,88,0.18)",
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    image={vehicle.image || placeholderImage}
                    alt={vehicle.vehicleType}
                    sx={{
                      width: 180,
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 3,
                      border: "2px solid #e3e3e3",
                      mb: 2,
                      background: "#f4f8fb",
                    }}
                    onError={(e) => {
                      e.target.src = placeholderImage;
                    }}
                  />
                  <CardContent sx={{ p: 0, textAlign: "center", width: "100%" }}>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{ color: "#3949ab", mb: 0.5 }}
                    >
                      {vehicle.vehicleType}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="primary"
                      fontWeight={600}
                      sx={{
                        mb: 0.5,
                        letterSpacing: 1,
                        background: "#e3f2fd",
                        borderRadius: 1,
                        px: 1,
                        display: "inline-block",
                      }}
                    >
                      {vehicle.licensePlate}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1, mt: 0.5 }}
                    >
                      Capacity: <b>{vehicle.loadCapacity}</b>
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      District: <b>{vehicle.district || "N/A"}</b>
                    </Typography>
                  </CardContent>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      mt: "auto",
                      width: "90%",
                      borderRadius: 2,
                      fontWeight: 600,
                      letterSpacing: 1,
                    }}
                    onClick={() => handleBook(vehicle)}
                  >
                    Book
                  </Button>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>

      {/* Booking Modal */}
      <Dialog 
        open={openModal} 
        onClose={() => setOpenModal(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '95vh',
            overflow: 'hidden',
            zIndex: 1300, // Standard MUI Dialog z-index
            minWidth: '800px',
            width: '90vw'
          }
        }}
        BackdropProps={{
          sx: {
            zIndex: 1299
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: "center", 
          fontWeight: 700, 
          background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
          color: "white",
          fontSize: "1.5rem",
          py: 3,
          position: "relative",
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1)',
          }
        }}>
          🚚 Book Your Vehicle
        </DialogTitle>
        <DialogContent sx={{ p: 0, maxHeight: '80vh', overflowY: 'auto' }}>
          <Box
            component="form"
            onSubmit={handleBookingSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              p: 5,
              background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
              minHeight: "600px",
            }}
          >
            {/* Vehicle Info Section */}
            <Box sx={{ 
              background: 'white', 
              borderRadius: 2, 
              p: 4, 
              mb: 2, 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 600 }}>
                🚗 Selected Vehicle Details
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: '250px' }}>
                  <Typography variant="body2" color="text.secondary">Vehicle Type:</Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1.1rem' }}>{selectedVehicle?.vehicleType}</Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: '250px' }}>
                  <Typography variant="body2" color="text.secondary">License Plate:</Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1.1rem' }}>{selectedVehicle?.licensePlate}</Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: '250px' }}>
                  <Typography variant="body2" color="text.secondary">Load Capacity:</Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1.1rem' }}>{selectedVehicle?.loadCapacity} kg</Typography>
                </Box>
              </Box>
            </Box>

            {/* Contact Information */}
            <Box sx={{ 
              background: 'white', 
              borderRadius: 2, 
              p: 4, 
              mb: 2, 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 600 }}>
                📞 Contact Information
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#333' }}>
                  Merchant Telephone Number *
                </Typography>
                <TextField
                  name="phone"
                  value={bookingForm.phone}
                  onChange={handleBookingInputChange}
                  required
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your phone number"
                  size="medium"
                  InputProps={{
                    style: { borderRadius: 10, fontSize: '1rem' },
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Location Information */}
            <Box sx={{ 
              background: 'white', 
              borderRadius: 2, 
              p: 4, 
              mb: 2, 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 600 }}>
                📍 Delivery Locations
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#333' }}>
                    Start Delivery Location * (Harvest Location)
                  </Typography>
                  <TextField
                    name="startLocation"
                    value={bookingForm.startLocation}
                    onChange={handleBookingInputChange}
                    required
                    fullWidth
                    variant="outlined"
                    placeholder={
                      isLoadingLocation 
                        ? "Loading harvest location..." 
                        : productDetails?.location?.address || "Harvest pickup location (auto-filled)"
                    }
                    size="medium"
                    InputProps={{
                      style: { borderRadius: 10, fontSize: '1rem' },
                      readOnly: true,
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f5f5',
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#333' }}>
                    End Delivery Location *
                  </Typography>
                  <TextField
                    name="endLocation"
                    value={bookingForm.endLocation}
                    onChange={handleBookingInputChange}
                    required
                    fullWidth
                    variant="outlined"
                    placeholder="Enter delivery destination"
                    size="medium"
                    InputProps={{
                      style: { borderRadius: 10, fontSize: '1rem' },
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Add your delivery location. Click Here!" arrow>
                            <IconButton
                              onClick={() => {
                                setSelectedLocationData(null); // Reset selected location
                                setOpenLocationModal(true);
                              }}
                              size="small"
                              sx={{
                                backgroundColor: '#1976d2',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: '#1565c0',
                                },
                                borderRadius: 1,
                                px: 1.5,
                                py: 0.5,
                              }}
                            >
                              🗺️ Open Map
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Transport Details */}
            <Box sx={{ 
              background: 'white', 
              borderRadius: 2, 
              p: 4, 
              mb: 2, 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 600 }}>
                📦 Transport Details
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
                <Box sx={{ flex: 1, minWidth: '300px' }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#333' }}>
                    Item Code
                  </Typography>
                  <TextField
                    name="itemCode"
                    value={bookingForm.itemCode}
                    fullWidth
                    variant="outlined"
                    placeholder="Item code"
                    size="medium"
                    InputProps={{
                      style: { borderRadius: 10, fontSize: '1rem' },
                      readOnly: true,
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f5f5',
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: '300px' }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#333' }}>
                    Items to Transport *
                  </Typography>
                  <TextField
                    name="items"
                    value={bookingForm.items}
                    onChange={handleBookingInputChange}
                    required
                    fullWidth
                    variant="outlined"
                    placeholder="Describe items to be transported"
                    size="medium"
                    InputProps={{
                      style: { borderRadius: 10, fontSize: '1rem' },
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: '250px' }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#333' }}>
                    Weight to Transport (Kg) *
                  </Typography>
                  <TextField
                    name="weight"
                    value={bookingForm.weight}
                    onChange={handleBookingInputChange}
                    required
                    fullWidth
                    variant="outlined"
                    placeholder="Enter weight in kg"
                    size="medium"
                    InputProps={{
                      style: { borderRadius: 10, fontSize: '1rem' },
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                    type="number"
                    inputProps={{ min: 1 }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <DialogActions sx={{ 
              px: 0, 
              pt: 4, 
              gap: 3, 
              justifyContent: 'center',
              background: 'transparent'
            }}>
              <Button 
                onClick={() => setOpenModal(false)} 
                variant="outlined" 
                sx={{ 
                  borderRadius: 3, 
                  px: 6, 
                  py: 2,
                  borderColor: '#64748b',
                  color: '#64748b',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '18px',
                  minWidth: '150px',
                  '&:hover': {
                    borderColor: '#475569',
                    backgroundColor: '#f8fafc'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                sx={{ 
                  borderRadius: 3, 
                  px: 6, 
                  py: 2,
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '18px',
                  minWidth: '150px',
                  boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                  }
                }}
              >
                🚚 Book Vehicle
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Location Selection Modal */}
      <Dialog
        open={openLocationModal}
        onClose={() => setOpenLocationModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh',
            overflow: 'hidden',
            zIndex: 2100, // Higher than booking modal
          }
        }}
        BackdropProps={{
          sx: {
            zIndex: 2099
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: "center", 
          fontWeight: 700, 
          background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
          color: "white",
          fontSize: "1.5rem",
          py: 3,
          position: "relative",
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1)',
          }
        }}>
          📍 Select Your Delivery Location
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <LocateMe 
            onLocationSelect={(locationData) => {
              // Store the selected location data but don't close the modal
              setSelectedLocationData(locationData);
            }}
            buttonText="📍 Get Current Location"
            showMap={true}
            mapHeight="400px"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2, justifyContent: 'flex-end' }}>
          <Button 
            onClick={() => {
              setOpenLocationModal(false);
              setSelectedLocationData(null); // Reset selected location
            }} 
            variant="outlined" 
            sx={{ 
              borderRadius: 2, 
              px: 3, 
              py: 1,
              borderColor: '#64748b',
              color: '#64748b',
              '&:hover': {
                borderColor: '#475569',
                backgroundColor: '#f8fafc'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              // Use the selected location data when user confirms
              if (selectedLocationData) {
                setBookingForm(prev => ({
                  ...prev,
                  endLocation: selectedLocationData.address || `${selectedLocationData.coordinates.lat.toFixed(6)}, ${selectedLocationData.coordinates.lng.toFixed(6)}`
                }));
              }
              setOpenLocationModal(false);
            }}
            variant="contained" 
            disabled={!selectedLocationData}
            sx={{ 
              borderRadius: 2, 
              px: 4, 
              py: 1,
              background: selectedLocationData ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' : 'grey',
              fontWeight: 600,
              boxShadow: selectedLocationData ? '0 4px 15px rgba(25, 118, 210, 0.3)' : 'none',
              '&:hover': {
                background: selectedLocationData ? 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)' : 'grey',
                boxShadow: selectedLocationData ? '0 6px 20px rgba(25, 118, 210, 0.4)' : 'none',
              }
            }}
          >
            Use This Location
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default FindVehicles;