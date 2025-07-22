import React, { useEffect, useState } from "react";
import { getVehicles, createBooking } from "../services/api";
import placeholderImage from "../assets/lorry.jpg";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
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
import { ArrowBack } from "@mui/icons-material";
import LocateMe from "../components/LocateMe"; // Import LocateMe component

const allDistricts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
  "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee"
];

const FindVehicles = ({ selectedOrders, onBack, user: userProp }) => {
  const { user: auth0User } = useAuth0();
  const user = userProp || auth0User; // Use prop user or auth0 user
  
  // Debug logging to see what's in selectedOrders
  console.log("FindVehicles - selectedOrders:", selectedOrders);
  console.log("FindVehicles - user:", user);
  
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
  const [capacityError, setCapacityError] = useState(""); // Add capacity error state
  const [capacityFilter, setCapacityFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [openLocationModal, setOpenLocationModal] = useState(false); // Add location modal state
  const [selectedLocationData, setSelectedLocationData] = useState(null); // Track selected location
  const [bookingSuccess, setBookingSuccess] = useState(false); // Track booking success
  const [bookedVehicleDetails, setBookedVehicleDetails] = useState(null); // Store booked vehicle details

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    phone: "",
    startLocation: "", // Will be populated from product details or multiple locations
    endLocation: "", // Keep this empty - don't auto-fill
    items: selectedOrders?.length > 0 ? 
      selectedOrders.map(order => order?.productName || order?.items?.[0]?.name || 'Product').join(', ') :
      selectedConfirmedBid?.items?.[0]?.name || "",
    weight: selectedOrders?.length > 0 ? 
      selectedOrders.reduce((total, order) => total + (order?.orderWeight || order?.items?.[0]?.quantity || 0), 0) :
      selectedConfirmedBid?.items?.[0]?.quantity || "",
  });
  
  // Update booking form when product details are loaded
  useEffect(() => {
    // Handle multiple orders case
    if (selectedOrders && selectedOrders.length > 1) {
      const locations = selectedOrders.map((order, index) => {
        const productName = order?.productName || order?.items?.[0]?.name || 'Product';
        const location = order?.productLocation?.address || 
                        order?.location?.displayAddress || 
                        order?.farmerDetails?.address || 
                        "Location not available";
        return `${index + 1}. ${productName} - ${location}`;
      }).join('\n');
      
      setBookingForm(prev => ({
        ...prev,
        startLocation: `Multiple Pickup Locations:\n${locations}`,
        items: selectedOrders.map(order => order?.productName || order?.items?.[0]?.name || 'Product').join(', '),
        weight: selectedOrders.reduce((total, order) => total + (order?.orderWeight || order?.items?.[0]?.quantity || 0), 0),
      }));
      return;
    }
    
    // Handle single order case (existing logic)
    // First check if we have location data directly from confirmed bid
    if (selectedConfirmedBid?.productLocation) {
      setBookingForm(prev => ({
        ...prev,
        startLocation: selectedConfirmedBid.productLocation.address || "Harvest location not available",
        items: selectedConfirmedBid?.items?.[0]?.name || prev.items,
        weight: selectedConfirmedBid?.items?.[0]?.quantity || prev.weight,
      }));
    } else if (productDetails && productDetails.location) {
      setBookingForm(prev => ({
        ...prev,
        startLocation: productDetails.location.address || "Harvest location not available",
        items: productDetails.name || selectedConfirmedBid?.items?.[0]?.name || prev.items,
        weight: selectedConfirmedBid?.items?.[0]?.quantity || prev.weight,
      }));
    }
  }, [productDetails, selectedConfirmedBid, selectedOrders]);

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
        // Sort vehicles by creation date in descending order (newest first)
        const sortedVehicles = data.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.updatedAt || 0);
          const dateB = new Date(b.createdAt || b.updatedAt || 0);
          return dateB - dateA; // Newest first
        });
        setVehicles(sortedVehicles);
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
  const handleBook = async (vehicle) => {
    console.log("Selected Vehicle:", vehicle); // Debugging log
    
    // Calculate total weight of orders
    const totalWeight = selectedOrders?.length > 0 ? 
      selectedOrders.reduce((total, order) => total + (order?.orderWeight || order?.items?.[0]?.quantity || 0), 0) :
      selectedConfirmedBid?.items?.[0]?.quantity || 0;
    
    const vehicleCapacity = parseInt(vehicle.loadCapacity, 10) || 0;
    
    console.log("Total weight:", totalWeight, "kg");
    console.log("Vehicle capacity:", vehicleCapacity, "kg");
    
    // Check if total weight exceeds vehicle capacity
    if (totalWeight > vehicleCapacity) {
      setCapacityError(`Cannot book this vehicle! Total order weight (${totalWeight}kg) exceeds vehicle capacity (${vehicleCapacity}kg). Please choose another vehicle that matches your total quantity.`);
      // Clear error after 5 seconds
      setTimeout(() => setCapacityError(""), 5000);
      return;
    }
    
    // Clear any previous capacity errors
    setCapacityError("");
    
    // Fetch transporter details to get contact number
    try {
      const transporterResponse = await axios.get(`http://localhost:5000/api/users/${encodeURIComponent(vehicle.transporterId)}`);
      const transporterData = transporterResponse.data;
      
      // Set vehicle with transporter contact info
      setSelectedVehicle({
        ...vehicle,
        transporterPhone: transporterData.phone,
        transporterName: transporterData.name
      });
    } catch (error) {
      console.error("Error fetching transporter details:", error);
      // Still set vehicle even if transporter details fail
      setSelectedVehicle({
        ...vehicle,
        transporterPhone: "Contact number not available",
        transporterName: "Name not available"
      });
    }
    
    // Don't override booking form if we have multiple orders (already properly initialized)
    if (!selectedOrders || selectedOrders.length <= 1) {
      setBookingForm((prev) => ({
        ...prev,
        items: productDetails?.name || selectedConfirmedBid?.items?.[0]?.name || prev.items,
        weight: selectedConfirmedBid?.items?.[0]?.quantity || prev.weight,
        startLocation: productDetails?.location?.address || "Harvest location not available", // Use product location
        endLocation: "", // Don't auto-fill end location
      }));
    }
    setOpenModal(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedVehicle(null);
    setBookingSuccess(false);
    setBookedVehicleDetails(null);
    setBookingForm({
      phone: "",
      startLocation: productDetails?.location?.address || "Location not available", // Use product location
      endLocation: "", // Reset to empty
      items: productDetails?.name || selectedConfirmedBid?.items?.[0]?.name || "",
      weight: selectedConfirmedBid?.items?.[0]?.quantity || "",
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
      merchantId: user?.sub, // Add merchant Auth0 ID
      merchantName: user?.name, // Add merchant name
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
      
      // Fetch transporter details to get phone number
      try {
        const transporterResponse = await axios.get(`http://localhost:5000/api/users/${encodeURIComponent(selectedVehicle.transporterId)}`);
        const transporterData = transporterResponse.data;
        console.log("Transporter details fetched:", transporterData);
        
        // Store booked vehicle details with transporter phone
        setBookedVehicleDetails({
          ...selectedVehicle,
          transporterPhone: transporterData.phone,
          transporterName: transporterData.name
        });
      } catch (transporterError) {
        console.error("Error fetching transporter details:", transporterError);
        // Still show success but without phone number
        setBookedVehicleDetails(selectedVehicle);
      }
      
      setBookingSuccess(true);
      // Don't close modal immediately - show success message first
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
    <Box sx={{ p: 3, background: "#f0f9ff", minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Header with Back Button */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          {onBack && (
            <IconButton
              onClick={onBack}
              sx={{
                mr: 2,
                backgroundColor: "#2563eb",
                color: "white",
                borderRadius: 2,
                padding: "8px",
                "&:hover": {
                  backgroundColor: "#1d4ed8",
                },
              }}
            >
              <ArrowBack />
            </IconButton>
          )}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1e40af",
              letterSpacing: 1,
            }}
          >
            Find Vehicles
          </Typography>
        </Box>
        
        {/* Total Weight Information */}
        {(() => {
          const totalWeight = selectedOrders?.length > 0 ? 
            selectedOrders.reduce((total, order) => total + (order?.orderWeight || order?.items?.[0]?.quantity || 0), 0) :
            selectedConfirmedBid?.items?.[0]?.quantity || 0;
          
          if (totalWeight > 0) {
            return (
              <Box sx={{ 
                mb: 3, 
                p: 2, 
                backgroundColor: '#e3f2fd', 
                borderRadius: 2, 
                border: '1px solid #1976d2',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600 }}>
                  📦 Total Load Weight: {totalWeight}kg
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Please choose a vehicle with capacity greater than {totalWeight}kg
                </Typography>
              </Box>
            );
          }
          return null;
        })()}
        
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 3, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontWeight: 500, color: "#333", fontSize: "0.95rem" }}>Capacity:</Typography>
            <FormControl
              size="small"
              sx={{
                minWidth: 150,
                background: "#fff",
                borderRadius: 1,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#1976d2",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1976d2",
                  },
                },
              }}
            >
              <Select
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
                displayEmpty
                sx={{
                  fontSize: "0.9rem",
                  color: capacityFilter ? "#333" : "#666",
                }}
              >
                {capacityRanges.map((range) => (
                  <MenuItem key={range.value} value={range.value}>
                    {range.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontWeight: 500, color: "#333", fontSize: "0.95rem" }}>District:</Typography>
            <FormControl
              size="small"
              sx={{
                minWidth: 150,
                background: "#fff",
                borderRadius: 1,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#1976d2",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1976d2",
                  },
                },
              }}
            >
              <Select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                displayEmpty
                sx={{
                  fontSize: "0.9rem",
                  color: districtFilter ? "#333" : "#666",
                }}
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
        </Box>
        
        {/* Capacity Error Alert */}
        {capacityError && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              backgroundColor: '#ffebee',
              borderColor: '#f44336',
              '& .MuiAlert-icon': {
                color: '#f44336'
              }
            }}
            onClose={() => setCapacityError("")}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {capacityError}
            </Typography>
          </Alert>
        )}
        
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
            filteredVehicles.map((vehicle) => {
              // Calculate total weight for each vehicle card
              const totalWeight = selectedOrders?.length > 0 ? 
                selectedOrders.reduce((total, order) => total + (order?.orderWeight || order?.items?.[0]?.quantity || 0), 0) :
                selectedConfirmedBid?.items?.[0]?.quantity || 0;
              
              const vehicleCapacity = parseInt(vehicle.loadCapacity, 10) || 0;
              const isCapacityExceeded = totalWeight > vehicleCapacity;
              
              return (
                <Grid item key={vehicle._id} xs={12} sm={6} md={4} lg={3}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    p: 2,
                    minHeight: 280,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transition: "all 0.3s ease",
                    border: "1px solid #e0e0e0",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    image={vehicle.image || placeholderImage}
                    alt={vehicle.vehicleType}
                    sx={{
                      width: 150,
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 2,
                      mb: 1.5,
                      background: "#f5f5f5",
                    }}
                    onError={(e) => {
                      e.target.src = placeholderImage;
                    }}
                  />
                  <CardContent sx={{ p: 0, textAlign: "center", width: "100%", flex: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{ 
                        color: "#1976d2", 
                        mb: 0.5,
                        fontSize: "1.1rem"
                      }}
                    >
                      {vehicle.vehicleType}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 0.5,
                        color: "#1976d2",
                        fontWeight: 500,
                        fontSize: "0.9rem"
                      }}
                    >
                      {vehicle.licensePlate}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ 
                        mb: 0.5, 
                        fontSize: "0.85rem",
                        color: isCapacityExceeded ? "#f44336" : "#2e7d32",
                        fontWeight: isCapacityExceeded ? 600 : 400
                      }}
                    >
                      Capacity: {vehicle.loadCapacity}kg
                      {totalWeight > 0 && (
                        <span style={{ 
                          display: 'block', 
                          fontSize: '0.75rem',
                          color: isCapacityExceeded ? "#f44336" : "#666"
                        }}>
                          Your load: {totalWeight}kg {isCapacityExceeded ? "⚠️ Exceeds capacity!" : "✓ Fits"}
                        </span>
                      )}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5, fontSize: "0.85rem" }}
                    >
                      District: {vehicle.district || "N/A"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1.5, fontSize: "0.85rem" }}
                    >
                      Price per Km: {vehicle.pricePerKm || "###"}
                    </Typography>
                  </CardContent>
                  <Button
                    variant="contained"
                    disabled={isCapacityExceeded}
                    sx={{
                      width: "100%",
                      borderRadius: 1,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      backgroundColor: isCapacityExceeded ? "#f44336" : "#1976d2",
                      color: "white",
                      fontSize: "0.9rem",
                      py: 1,
                      "&:hover": {
                        backgroundColor: isCapacityExceeded ? "#f44336" : "#1565c0",
                      },
                      "&:disabled": {
                        backgroundColor: "#bdbdbd",
                        color: "#666",
                      },
                    }}
                    onClick={() => handleBook(vehicle)}
                  >
                    {isCapacityExceeded ? "CAPACITY EXCEEDED" : "BOOK"}
                  </Button>
                </Card>
              </Grid>
              );
            })
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
          background: bookingSuccess 
            ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" 
            : "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
          color: "white",
          fontSize: "1.5rem",
          py: 3,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: bookingSuccess 
              ? 'linear-gradient(90deg, #22c55e, #16a34a, #15803d)' 
              : 'linear-gradient(90deg, #2563eb, #3b82f6, #1d4ed8)',
          }
        }}>
          <IconButton
            onClick={() => {
              setOpenModal(false);
              if (onBack) onBack();
            }}
            sx={{
              position: 'absolute',
              left: 16,
              color: 'white',
              borderRadius: 2,
              padding: '8px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ArrowBack />
          </IconButton>
          {bookingSuccess ? '🎉 Booking Confirmed!' : '🚚 Book Your Vehicle'}
        </DialogTitle>
        <DialogContent sx={{ p: 0, maxHeight: '80vh', overflowY: 'auto' }}>
          {!bookingSuccess ? (
            // Booking Form
            <Box
              component="form"
              onSubmit={handleBookingSubmit}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                p: 5,
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                minHeight: "600px",
              }}
            >
            {/* Vehicle Info Section */}
            <Box sx={{ 
              background: 'white', 
              borderRadius: 2, 
              p: 4, 
              mb: 2, 
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.1)',
              border: '1px solid #dbeafe'
            }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#2563eb', fontWeight: 600 }}>
                🚗 Selected Vehicle Details
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Vehicle Type:</Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1.1rem' }}>{selectedVehicle?.vehicleType}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">License Plate:</Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1.1rem' }}>{selectedVehicle?.licensePlate}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Load Capacity:</Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1.1rem' }}>{selectedVehicle?.loadCapacity} kg</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Transporter Contact:</Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1.1rem' }}>
                    {selectedVehicle?.transporterPhone || "Loading..."}
                  </Typography>

                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Price per KM:</Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1.1rem' }}>
                    {selectedVehicle?.pricePerKm ? `LKR ${selectedVehicle.pricePerKm}` : "###(Please contact transporter)"}
                  </Typography>
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
              
              {/* Multiple Pickup Locations Section */}
              {selectedOrders && selectedOrders.length > 1 ? (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    mb: 2 
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                      Pickup Locations * (As per your arranged sequence)
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setOpenModal(false);
                        if (onBack) onBack();
                      }}
                      sx={{
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        px: 2,
                        py: 0.5,
                        borderColor: '#1976d2',
                        color: '#1976d2',
                        '&:hover': {
                          borderColor: '#1565c0',
                          backgroundColor: '#e3f2fd',
                        },
                      }}
                    >
                      Change Pickup Orders
                    </Button>
                  </Box>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: '#e3f2fd', 
                    borderRadius: 1, 
                    border: '1px solid #1976d2',
                    mb: 2
                  }}>
                    <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600, mb: 1 }}>
                      ℹ️ Collection Sequence:
                    </Typography>
                    {selectedOrders.map((order, index) => {
                      const productName = order?.productName || order?.items?.[0]?.name || 'Product';
                      const location = order?.productLocation?.address || 
                                     order?.location?.displayAddress || 
                                     order?.farmerDetails?.address || 
                                     "Location not available";
                      const farmerPhone = order?.farmerDetails?.phone || 
                                         order?.farmerPhone || 
                                         "Contact not available";
                      return (
                        <Box key={order._id || index} sx={{ 
                          mb: 1, 
                          p: 1.5, 
                          backgroundColor: 'white', 
                          borderRadius: 1, 
                          border: '1px solid #bbdefb' 
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1565c0' }}>
                            {index + 1}. {productName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#424242', fontSize: '0.85rem' }}>
                            📍 {location}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem', mt: 0.5 }}>
                            📞 {farmerPhone}
                          </Typography>
                        </Box>
                      );
                    })}
                    <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic', mt: 1 }}>
                      💡 If you need to change the collection order, please go back and rearrange the orders.
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ mb: 3 }}>
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
              )}
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              
              {/* Show order summary for multiple orders */}
              {selectedOrders && selectedOrders.length > 1 && (
                <Box sx={{ 
                  mb: 3, 
                  p: 2, 
                  backgroundColor: '#f0f9ff', 
                  borderRadius: 1, 
                  border: '1px solid #3b82f6' 
                }}>
                  <Typography variant="body2" sx={{ color: '#1e40af', fontWeight: 600, mb: 1 }}>
                    📋 Multiple Orders Summary:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1e40af' }}>
                    Total Items: {selectedOrders.length} different products<br/>
                    Total Weight: {selectedOrders.reduce((total, order) => total + (order?.orderWeight || order?.items?.[0]?.quantity || 0), 0)} kg<br/>
                    Collection Sequence: As arranged in the previous step
                  </Typography>
                </Box>
              )}
              
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
                    multiline={selectedOrders && selectedOrders.length > 1}
                    rows={selectedOrders && selectedOrders.length > 1 ? 3 : 1}
                    InputProps={{
                      style: { borderRadius: 10, fontSize: '1rem' },
                      readOnly: selectedOrders && selectedOrders.length > 1,
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: selectedOrders && selectedOrders.length > 1 ? '#f5f5f5' : 'white',
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
                    Total Weight to Transport (Kg) *
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
                      readOnly: selectedOrders && selectedOrders.length > 1,
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: selectedOrders && selectedOrders.length > 1 ? '#f5f5f5' : 'white',
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
              
              {/* Note about changing arrangement for multiple orders */}
              {selectedOrders && selectedOrders.length > 1 && (
                <Box sx={{ 
                  mt: 3, 
                  p: 2, 
                  backgroundColor: '#fff3cd', 
                  borderRadius: 1, 
                  border: '1px solid #ffc107' 
                }}>
                  <Typography variant="body2" sx={{ color: '#856404', fontWeight: 600, mb: 1 }}>
                    ⚠️ Need to change the collection order?
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#856404' }}>
                    If you need to modify the pickup sequence or arrangement, please go back to the previous step and rearrange your orders before proceeding with the booking.
                  </Typography>
                </Box>
              )}
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
          ) : (
            // Success Message
            <Box sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              p: 5,
              background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
              minHeight: "600px",
              textAlign: "center"
            }}>
              {/* Success Icon */}
              <Box sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 32px rgba(34, 197, 94, 0.3)",
                mb: 2
              }}>
                <Box component="span" sx={{ fontSize: "3rem", color: "white" }}>✅</Box>
              </Box>

              {/* Success Message */}
              <Typography variant="h4" sx={{ 
                color: "#1976d2", 
                fontWeight: 700, 
                mb: 2,
                fontSize: "2rem"
              }}>
                🎉 Booking Successful!
              </Typography>
              
              <Typography variant="h6" sx={{ 
                color: "#374151", 
                fontWeight: 500,
                mb: 3,
                maxWidth: "600px",
                lineHeight: 1.6
              }}>
                Your vehicle booking has been confirmed! The transporter {bookedVehicleDetails?.transporterName ? `"${bookedVehicleDetails.transporterName}"` : ''} has been notified and will contact you shortly to coordinate the pickup and delivery details.
              </Typography>

              {/* Vehicle Details */}
              <Box sx={{ 
                background: 'white', 
                borderRadius: 2, 
                p: 4, 
                mb: 3, 
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                width: '100%',
                maxWidth: '600px'
              }}>
                <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 600 }}>
                  🚗 Booked Vehicle Details
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1, minWidth: '150px' }}>
                    <Typography variant="body2" color="text.secondary">Vehicle Type:</Typography>
                    <Typography variant="body1" fontWeight={600}>{bookedVehicleDetails?.vehicleType}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: '150px' }}>
                    <Typography variant="body2" color="text.secondary">License Plate:</Typography>
                    <Typography variant="body1" fontWeight={600}>{bookedVehicleDetails?.licensePlate}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: '150px' }}>
                    <Typography variant="body2" color="text.secondary">Load Capacity:</Typography>
                    <Typography variant="body1" fontWeight={600}>{bookedVehicleDetails?.loadCapacity} kg</Typography>
                  </Box>
                </Box>
                
                {/* Transporter Contact Info */}
                {bookedVehicleDetails?.transporterName && (
                  <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e2e8f0' }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
                      📞 Transporter Contact
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                      <Box sx={{ flex: 1, minWidth: '150px' }}>
                        <Typography variant="body2" color="text.secondary">Name:</Typography>
                        <Typography variant="body1" fontWeight={600}>{bookedVehicleDetails.transporterName}</Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: '150px' }}>
                        <Typography variant="body2" color="text.secondary">Phone:</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {bookedVehicleDetails.transporterPhone || 'Contact number loading...'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  disabled={!bookedVehicleDetails?.transporterPhone}
                  sx={{ 
                    borderRadius: 3, 
                    px: 6, 
                    py: 2,
                    background: bookedVehicleDetails?.transporterPhone 
                      ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
                      : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '18px',
                    minWidth: '180px',
                    boxShadow: bookedVehicleDetails?.transporterPhone 
                      ? '0 4px 15px rgba(22, 163, 74, 0.3)'
                      : '0 4px 15px rgba(107, 114, 128, 0.3)',
                    '&:hover': {
                      background: bookedVehicleDetails?.transporterPhone 
                        ? 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)'
                        : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                      boxShadow: bookedVehicleDetails?.transporterPhone 
                        ? '0 6px 20px rgba(22, 163, 74, 0.4)'
                        : '0 6px 20px rgba(107, 114, 128, 0.4)',
                    }
                  }}
                  onClick={() => {
                    // Make a call to the transporter
                    if (bookedVehicleDetails?.transporterPhone) {
                      window.location.href = `tel:${bookedVehicleDetails.transporterPhone}`;
                    } else {
                      alert(`Transporter phone number not available yet. Please wait for ${bookedVehicleDetails?.transporterName || 'the transporter'} to contact you, or try refreshing the page.`);
                    }
                  }}
                >
                  📞 Call {bookedVehicleDetails?.transporterName || 'Transporter'}
                </Button>
                <Button 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 3, 
                    px: 6, 
                    py: 2,
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '18px',
                    minWidth: '150px',
                    '&:hover': {
                      borderColor: '#1565c0',
                      backgroundColor: '#f0f9ff'
                    }
                  }}
                  onClick={handleCloseModal}
                >
                  Close
                </Button>
              </Box>

              {/* Status Message */}
              <Typography variant="body2" sx={{ 
                color: "#6b7280", 
                fontStyle: "italic",
                mt: 2,
                maxWidth: "500px"
              }}>
                💡 Stay connected! {bookedVehicleDetails?.transporterName || 'The transporter'} will contact you once they confirm the booking. You can also call them directly using the button above{bookedVehicleDetails?.transporterPhone ? '' : ' once their contact information is available'}.
              </Typography>
            </Box>
          )}
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
          <IconButton
            onClick={() => setOpenLocationModal(false)}
            sx={{
              position: 'absolute',
              left: 16,
              color: 'white',
              borderRadius: 2,
              padding: '8px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ArrowBack />
          </IconButton>
          📍 Select Your Delivery Location
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <LocateMe 
            onLocationSelect={(locationData) => {
              // Store the selected location data but don't close the modal
              setSelectedLocationData(locationData);
            }}
            buttonText=" Get Current Location"
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