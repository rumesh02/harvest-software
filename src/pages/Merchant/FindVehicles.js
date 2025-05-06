import React, { useEffect, useState } from "react";
import { getVehicles } from "../../services/api";
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
} from "@mui/material";

const FindVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [capacityFilter, setCapacityFilter] = useState("");

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
        setError("Failed to load vehicles.");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Filter vehicles by selected capacity only
  const filteredVehicles = vehicles.filter((v) => {
    const cap = parseInt(v.loadCapacity, 10);
    return (
      !capacityFilter ||
      (capacityFilter === "below5000" && cap < 5000) ||
      (capacityFilter === "5000to10000" && cap >= 5000 && cap <= 10000) ||
      (capacityFilter === "above10000" && cap > 10000)
    );
  });

  const handleBook = (vehicle) => {
    alert(`Booking requested for vehicle: ${vehicle.licensePlate}`);
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
    </Box>
  );
};

export default FindVehicles;