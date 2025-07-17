import React, { useState } from "react";
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
  IconButton,
} from "@mui/material";
import { ArrowBack, LocationOn } from "@mui/icons-material";
import ReviewDialog from "../../components/ReviewDialog";
import LocateMe from "../../components/LocateMe";

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
  const [streetName, setStreetName] = useState("");
  const [city, setCity] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");

  const handleRateClick = (farmer) => {
    setSelectedFarmer(farmer);
    setReviewOpen(true);
  };

  const handleReviewSubmit = (review) => {
    alert(
      `Review submitted for ${selectedFarmer}!\nRating: ${review.rating}\nComment: ${review.comment}`
    );
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

                {/* Second row: See Location only */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
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
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '95vh',
            overflow: 'hidden',
            background: "#f0f9ff"
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          pb: 2,
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          color: 'white',
          position: 'relative'
        }}>
          <IconButton
            onClick={() => setLocationDialogOpen(false)}
            sx={{
              mr: 2,
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOn sx={{ mr: 1, color: 'white' }} />
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', fontSize: '20px' }}>
              Enter Location Details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            label="Street Name"
            fullWidth
            margin="normal"
            value={streetName}
            onChange={(e) => setStreetName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#2563eb',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#2563eb',
              },
            }}
          />
          <TextField
            label="City"
            fullWidth
            margin="normal"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#2563eb',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#2563eb',
              },
            }}
          />
          <LocateMe onLocationUpdate={handleLocationUpdate} />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setLocationDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: '#64748b',
              color: '#64748b',
              '&:hover': { 
                borderColor: '#475569', 
                backgroundColor: '#f8fafc'
              },
              textTransform: 'none',
              fontWeight: 600
            }}
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
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              '&:hover': { 
                background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)'
              },
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

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
