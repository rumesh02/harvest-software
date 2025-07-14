import React, { useState, lazy, Suspense } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import ReviewDialog from "../../components/ReviewDialog";
import LocateMe from "../../components/LocateMe";
const FindVehicles = lazy(() => import("../../components/FindVehicles"));

const purchases = [
  {
    id: 1,
    image: "https://d1obh0a64dzipo.cloudfront.net/images/4380.jpg",
    date: "2025-02-10",
    farmer: "Sunimal Perera",
    price: "Rs. 5000",
    quantity: "10 kg",
    status: "Delivered",
    location: "Colombo",
  },
  {
    id: 2,
    image:
      "https://www.tastingtable.com/img/gallery/why-are-red-onions-purple/intro-1644158494.jpg",
    date: "2025-02-10",
    farmer: "Sunimal Perera",
    price: "Rs. 5000",
    quantity: "10 kg",
    status: "Delivered",
    location: "Kandy",
  },
];

const PurchaseHistory = () => {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState("");
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [findVehiclesOpen, setFindVehiclesOpen] = useState(false);
  const [streetName, setStreetName] = useState("");
  const [city, setCity] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const handleRateClick = (farmer) => {
    setSelectedFarmer(farmer);
    setReviewOpen(true);
  };

  const handleReviewSubmit = (review) => {
    alert(
      `Review submitted for ${selectedFarmer}!\nRating: ${review.rating}\nComment: ${review.comment}`
    );
  };

  const handleFindVehicle = (purchase) => {
    setSelectedPurchase(purchase); // Pass the selected purchase data
    setFindVehiclesOpen(true);
  };

  const handleSeeLocationClick = () => {
    setLocationDialogOpen(true);
  };

  const handleLocationUpdate = (location) => {
    setCurrentLocation(location);
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h5" gutterBottom>
        Purchase History
      </Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>
        🛒 Recent Purchases
      </Typography>

      <Grid container spacing={1}>
        {purchases.map((purchase) => (
          <Grid item xs={12} sm={6} md={4} key={purchase.id}>
            <Card sx={{ maxWidth: 320, boxShadow: 3 }}>
              <CardMedia
                component="img"
                height="200"
                image={purchase.image}
                alt={purchase.product}
              />
              <CardContent>
                <Typography variant="body1">
                  <strong>Purchased on:</strong> {purchase.date}
                </Typography>
                <Typography variant="body1">
                  <strong>Farmer:</strong> {purchase.farmer}
                </Typography>
                <Typography variant="body1">
                  <strong>Price:</strong> {purchase.price}
                </Typography>
                <Typography variant="body1">
                  <strong>Quantity:</strong> {purchase.quantity}
                </Typography>
                <Typography variant="body1">
                  <strong>Status:</strong> {purchase.status}
                </Typography>
              </CardContent>

              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 1, p: 2 }}
              >
                {/* First row: View Invoice and Rate Farmer */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Button variant="contained" color="warning" sx={{ flex: 1 }}>
                    View Invoice
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    sx={{ flex: 1 }}
                    onClick={() => handleRateClick(purchase.farmer)}
                  >
                    Rate Farmer
                  </Button>
                </Box>

                {/* Second row: Find Vehicle and See Location */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ flex: 1 }}
                    onClick={() => handleFindVehicle(purchase)} // Pass purchase data
                  >
                    Find Vehicle
                  </Button>
                  <Button
                    variant="contained"
                    color="info"
                    sx={{ flex: 1 }}
                    onClick={handleSeeLocationClick}
                  >
                    See Location
                  </Button>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Location Dialog */}
      <Dialog
        open={locationDialogOpen}
        onClose={() => setLocationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Enter Location Details</DialogTitle>
        <DialogContent>
          <TextField
            label="Street Name"
            fullWidth
            margin="normal"
            value={streetName}
            onChange={(e) => setStreetName(e.target.value)}
          />
          <TextField
            label="City"
            fullWidth
            margin="normal"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <LocateMe onLocationUpdate={handleLocationUpdate} />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setLocationDialogOpen(false)}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              alert(
                `Street: ${streetName}, City: ${city}, Location: ${
                  currentLocation || "Not located"
                }`
              );
              setLocationDialogOpen(false);
            }}
            color="primary"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Find Vehicles Dialog (popup) */}
      <Suspense fallback={<div>Loading vehicle options...</div>}>
        <Dialog
          open={findVehiclesOpen}
          onClose={() => setFindVehiclesOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Find Vehicles</DialogTitle>
          <DialogContent dividers>
            <FindVehicles selectedPurchase={selectedPurchase} /> {/* Pass selected purchase */}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFindVehiclesOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Suspense>

      {/* Review Dialog */}
      <ReviewDialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        farmer={selectedFarmer}
        onSubmit={handleReviewSubmit}
      />
    </Box>
  );
};

export default PurchaseHistory;
