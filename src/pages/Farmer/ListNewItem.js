import React, { useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import LocateMe from "../../components/LocateMe";
import {
  Container,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  Box,
  Alert,
  Card,
  CardContent,
  InputAdornment,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Divider
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  AddCircle as AddCircleIcon,
  LocationOn as LocationOnIcon,
  Image as ImageIcon,
  Refresh as RefreshIcon,
  AttachMoney as MoneyIcon,
  Scale as ScaleIcon,
  Category as CategoryIcon,
  DriveFileRenameOutline as NameIcon
} from "@mui/icons-material";

const ListNewItem = () => {
  const [formData, setFormData] = useState({
    harvestType: "",
    harvestName: "",
    minBidPrice: "",
    availableWeight: "",
    images: [],
    location: {
      coordinates: null,
      address: ""
    }
  });

  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const { user } = useAuth0();

  // Handle location selection from LocateMe component
  const handleLocationSelect = (locationData) => {
    console.log("Location selected:", locationData);
    setFormData(prev => ({
      ...prev,
      location: {
        coordinates: locationData.coordinates,
        address: locationData.address
      }
    }));
  };

  // Save user location for future use
  const saveUserLocation = async (locationData) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${user.sub}/location`, {
        location: {
          coordinates: locationData.coordinates,
          address: locationData.address,
          lastUpdated: new Date()
        }
      });
      console.log("User location saved successfully");
    } catch (error) {
      console.error("Error saving user location:", error);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      if (!formData.images || formData.images.length === 0) {
        throw new Error("Please select at least one image");
      }

      // Convert first image to base64
      const imageFile = formData.images[0];
      const base64Image = await convertImageToBase64(imageFile);

      // Validate form data
      if (!formData.harvestType || !formData.harvestName || 
          !formData.minBidPrice || !formData.availableWeight) {
        throw new Error("Please fill in all required fields");
      }

      if (!formData.location.coordinates) {
        throw new Error("Please select a location for your harvest");
      }

      const productData = {
        type: formData.harvestType,
        name: formData.harvestName,
        price: Number(formData.minBidPrice),
        quantity: Number(formData.availableWeight),
        image: base64Image,
        farmerID: user.sub,
        location: {
          coordinates: formData.location.coordinates,
          address: formData.location.address
        }
      };

      console.log("Attempting to submit product:", productData);

      // Save location to user profile for future use
      await saveUserLocation(formData.location);

      // Submit product
      const response = await axios.post(
        "http://localhost:5000/api/products",
        productData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000,
        }
      );

      console.log("Server response:", response.data);

      if (response.status === 201) {
        setSubmitStatus({
          type: "success",
          message: `🎉 Success! Your ${formData.harvestName} listing has been added to the marketplace. Buyers can now discover and bid on your harvest!`
        });

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Reset form after a short delay to let user see the success message
        setTimeout(() => {
          handleReset();
        }, 3000);
      }
    } catch (error) {
      console.error("Submission error:", error);
      
      let errorMessage = "Failed to list product. ";
      if (error.code === "ECONNREFUSED") {
        errorMessage += "Cannot connect to server. Please check if the server is running.";
      } else if (error.code === "ETIMEDOUT") {
        errorMessage += "Connection timed out. Please try again.";
      } else if (error.response) {
        errorMessage += error.response.data.message || "Please try again.";
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      setSubmitStatus({
        type: "error",
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert image to base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No file provided"));
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(new Error("Error converting image: " + error));
    });
  };

  // Handle File Selection
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setFormData({ ...formData, images: [...formData.images, ...files] });
  };

  // Handle Drag Over Event
  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  // Handle Drag Leave Event
  const handleDragLeave = () => {
    setDragActive(false);
  };

  // Handle Drop Event
  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const files = Array.from(event.dataTransfer.files);
    setFormData({ ...formData, images: [...formData.images, ...files] });
  };

  const handleReset = () => {
    setFormData({
      harvestType: "",
      harvestName: "",
      minBidPrice: "",
      availableWeight: "",
      images: [],
      location: {
        coordinates: null,
        address: ""
      }
    });
    setSubmitStatus({ type: "", message: "" });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 600, 
              color: '#2E7D32',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <AddCircleIcon fontSize="large" />
            List New Item
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Add your harvest to the marketplace and connect with buyers
          </Typography>
        </Box>

        {/* Status Messages */}
        {submitStatus.message && (
          <Alert 
            severity={submitStatus.type === "success" ? "success" : "error"}
            sx={{ 
              mb: 3,
              ...(submitStatus.type === "success" && {
                backgroundColor: '#e8f5e8',
                border: '2px solid #4CAF50',
                '& .MuiAlert-icon': {
                  fontSize: '2rem'
                },
                '& .MuiAlert-message': {
                  fontSize: '1.1rem',
                  fontWeight: 500
                }
              })
            }}
            onClose={() => setSubmitStatus({ type: "", message: "" })}
          >
            {submitStatus.message}
          </Alert>
        )}

        {/* Loading Progress */}
        {isSubmitting && (
          <Box sx={{ width: '100%', mb: 3 }}>
            <LinearProgress />
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Harvest Type & Name */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Harvest Type"
                value={formData.harvestType}
                onChange={(e) =>
                  setFormData({ ...formData, harvestType: e.target.value })
                }
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">Select Harvest Type</MenuItem>
                <MenuItem value="vegetables">Vegetables</MenuItem>
                <MenuItem value="fruits">Fruits</MenuItem>
                <MenuItem value="grains">Grains</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Harvest Name"
                value={formData.harvestName}
                onChange={(e) =>
                  setFormData({ ...formData, harvestName: e.target.value })
                }
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NameIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="e.g., Organic Tomatoes"
              />
            </Grid>
          </Grid>

          {/* Minimum Bid Price & Available Weight */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Minimum Bid Price"
                value={formData.minBidPrice}
                onChange={(e) =>
                  setFormData({ ...formData, minBidPrice: e.target.value })
                }
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon />
                      Rs.
                    </InputAdornment>
                  ),
                }}
                placeholder="Enter minimum price per kg"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Available Weight Of Stock"
                value={formData.availableWeight}
                onChange={(e) =>
                  setFormData({ ...formData, availableWeight: e.target.value })
                }
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ScaleIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      Kg
                    </InputAdornment>
                  ),
                }}
                placeholder="Enter available weight"
              />
            </Grid>
          </Grid>

          {/* File Upload Section */}
          <Card sx={{ mb: 4, border: dragActive ? '2px dashed #4CAF50' : '2px dashed #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ImageIcon />
                Upload Images Of Harvest
              </Typography>
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: dragActive ? '#f8f9fa' : '#fafafa',
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#f0f0f0'
                  }
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileUpload').click()}
              >
                <input
                  type="file"
                  id="fileUpload"
                  style={{ display: 'none' }}
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <CloudUploadIcon sx={{ fontSize: 48, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Click to Upload
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or drag and drop your files here
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Supported formats: JPG, PNG, GIF (Max 5MB each)
                </Typography>
              </Box>

              {/* Show Selected Files */}
              {formData.images.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Selected Files ({formData.images.length})
                  </Typography>
                  <List dense>
                    {formData.images.map((file, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon>
                          <ImageIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={file.name}
                          secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Location Selection */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon />
                Select Harvest Location
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose the location where your harvest is available for pickup
              </Typography>
              <LocateMe 
                onLocationSelect={handleLocationSelect}
                buttonText="Select Location"
                className="w-100"
              />
              {formData.location.coordinates && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Selected Location:</strong> {formData.location.address || 
                      `${formData.location.coordinates.lat.toFixed(6)}, ${formData.location.coordinates.lng.toFixed(6)}`}
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Divider sx={{ mb: 3 }} />

          {/* Action Buttons */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Button 
                type="submit" 
                variant="contained"
                size="large"
                fullWidth
                disabled={isSubmitting}
                startIcon={<AddCircleIcon />}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  backgroundColor: submitStatus.type === "success" ? '#2E7D32' : '#4CAF50',
                  '&:hover': {
                    backgroundColor: submitStatus.type === "success" ? '#1B5E20' : '#45a049'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {isSubmitting ? "Adding..." : 
                 submitStatus.type === "success" ? "✓ Listed Successfully!" : 
                 "Add Listing"}
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button 
                type="button" 
                variant="outlined"
                size="large"
                fullWidth
                onClick={handleReset}
                startIcon={<RefreshIcon />}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderColor: '#757575',
                  color: '#757575',
                  '&:hover': {
                    borderColor: '#424242',
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                Reset Form
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ListNewItem;