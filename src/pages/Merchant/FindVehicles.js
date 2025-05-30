import React, { useEffect, useState } from "react";
import { getVehicles, createBooking } from "../../services/api";
import placeholderImage from "../../assets/lorry.jpg";
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
} from "@mui/material";

const allDistricts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
  "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee"
];

const FindVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [capacityFilter, setCapacityFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    phone: "",
    startLocation: "",
    endLocation: "",
    items: "",
    weight: "",
  });

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
    setSelectedVehicle(vehicle);
    setOpenModal(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedVehicle(null);
    setBookingForm({
      phone: "",
      startLocation: "",
      endLocation: "",
      items: "",
      weight: "",
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

    console.log({
      vehicleId: selectedVehicle._id,
      transporterId: selectedVehicle.transporterId,
      phone: bookingForm.phone,
      startLocation: bookingForm.startLocation,
      endLocation: bookingForm.endLocation,
      items: bookingForm.items,
      weight: bookingForm.weight,
      weightIsNumber: !isNaN(Number(bookingForm.weight)),
    });

    const bookingData = {
      vehicleId: selectedVehicle._id,
      transporterId: selectedVehicle.transporterId,
      merchantPhone: bookingForm.phone,
      startLocation: bookingForm.startLocation,
      endLocation: bookingForm.endLocation,
      items: bookingForm.items,
      weight: Number(bookingForm.weight),
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
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: "center", fontWeight: 700, color: "#1976d2" }}>
          Book Vehicle
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleBookingSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              mt: 1,
              background: "#f5faff",
              borderRadius: 2,
              p: 2,
              boxShadow: 1,
            }}
          >
            <TextField
              label="Merchant Telephone Number"
              name="phone"
              value={bookingForm.phone}
              onChange={handleBookingInputChange}
              required
              fullWidth
              variant="outlined"
              InputProps={{
                style: { borderRadius: 10 }
              }}
            />
            <TextField
              label="Start Delivery Location"
              name="startLocation"
              value={bookingForm.startLocation}
              onChange={handleBookingInputChange}
              required
              fullWidth
              variant="outlined"
              InputProps={{
                style: { borderRadius: 10 }
              }}
            />
            <TextField
              label="End Delivery Location"
              name="endLocation"
              value={bookingForm.endLocation}
              onChange={handleBookingInputChange}
              required
              fullWidth
              variant="outlined"
              InputProps={{
                style: { borderRadius: 10 }
              }}
            />
            <TextField
              label="Items to Transport"
              name="items"
              value={bookingForm.items}
              onChange={handleBookingInputChange}
              required
              fullWidth
              variant="outlined"
              InputProps={{
                style: { borderRadius: 10 }
              }}
            />
            <TextField
              label="Weight to Transport (Kg)"
              name="weight"
              value={bookingForm.weight}
              onChange={handleBookingInputChange}
              required
              fullWidth
              variant="outlined"
              InputProps={{
                style: { borderRadius: 10 }
              }}
              type="number"
              inputProps={{ min: 1 }}
            />
            <DialogActions sx={{ px: 0, mt: 1 }}>
              <Button onClick={handleCloseModal} color="secondary" variant="outlined" sx={{ borderRadius: 2 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 2 }}>
                Submit
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FindVehicles;