import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
  InputAdornment,
  Skeleton
} from '@mui/material';
import {
  LocalShipping as TruckIcon,
  Close as CloseIcon,
  DirectionsCar as CarIcon
} from '@mui/icons-material';
import './EditListed.css';

// Memoized Vehicle Card Component to prevent unnecessary re-renders
const VehicleCard = memo(({ vehicle, onEdit, onDelete }) => (
  <Card 
    className="vehicle-card"
    sx={{ 
      maxWidth: 300,
      borderRadius: 2,
      boxShadow: 3,
      m: 2,
      transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      "&:hover": {
        transform: "scale(1.05)",
        boxShadow: 5,
      },
    }}
  >
    {/* Vehicle Image */}
    <Box sx={{ 
      height: 180, 
      bgcolor: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px 8px 0 0'
    }}>
      {vehicle.image ? (
        <img
          src={vehicle.image.startsWith('data:') ? vehicle.image : `http://localhost:5000${vehicle.image}`}
          alt={vehicle.vehicleType}
          loading="lazy" // Add lazy loading for better performance
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '8px 8px 0 0'
          }}
          onError={(e) => {
            // Fallback to truck icon if image fails to load
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <Box 
        sx={{ 
          display: vehicle.image ? 'none' : 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <TruckIcon sx={{ fontSize: 60, color: '#4CAF50' }} />
      </Box>
    </Box>

    <CardContent sx={{ p: 2.5 }}>
      <Typography variant="h6" fontWeight="bold">
        {vehicle.vehicleType}
      </Typography>
      
      <Typography variant="body1" color="text.secondary">
        License: {vehicle.licensePlate}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Capacity: {vehicle.loadCapacity} kg
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Rate: LKR {vehicle.pricePerKm}/km
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Location: {vehicle.district || vehicle.location}
      </Typography>

      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onEdit(vehicle)}
          sx={{ flex: 1 }}
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => onDelete(vehicle._id)}
          sx={{ flex: 1 }}
        >
          Delete
        </Button>
      </Box>
    </CardContent>
  </Card>
));

VehicleCard.displayName = 'VehicleCard';

// Skeleton loading component for better perceived performance
const VehicleCardSkeleton = memo(() => (
  <Card sx={{ maxWidth: 300, borderRadius: 2, boxShadow: 3, m: 2 }}>
    <Skeleton variant="rectangular" height={180} sx={{ borderRadius: '8px 8px 0 0' }} />
    <CardContent sx={{ p: 2.5 }}>
      <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
      <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 0.5 }} />
      <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 0.5 }} />
      <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 0.5 }} />
      <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Skeleton variant="rectangular" height={36} sx={{ flex: 1, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={36} sx={{ flex: 1, borderRadius: 1 }} />
      </Box>
    </CardContent>
  </Card>
));

VehicleCardSkeleton.displayName = 'VehicleCardSkeleton';

const EditListed = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false); // Start with false, only set true when actually fetching
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicleType: '',
    licensePlate: '',
    loadCapacity: '',
    pricePerKm: '',
    location: '',
    image: null
  });

  // Cache key for localStorage
  const cacheKey = useMemo(() => `vehicles_${user?.sub}`, [user?.sub]);

  // Memoize the initial form data to prevent unnecessary re-renders
  const initialFormData = useMemo(() => ({
    vehicleType: '',
    licensePlate: '',
    loadCapacity: '',
    pricePerKm: '',
    location: '',
    image: null
  }), []);

  // Reset form - memoized to prevent re-creation (define early to avoid hoisting issues)
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  // Handle form input changes - memoized to prevent re-creation
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Load vehicles from cache on mount
  useEffect(() => {
    if (!user?.sub) return;
    
    try {
      const cachedVehicles = localStorage.getItem(cacheKey);
      if (cachedVehicles) {
        const parsedVehicles = JSON.parse(cachedVehicles);
        // Check if cache is less than 5 minutes old
        const cacheTime = localStorage.getItem(`${cacheKey}_timestamp`);
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        
        if (cacheTime && parseInt(cacheTime) > fiveMinutesAgo) {
          console.log('📦 Loading vehicles from cache');
          setVehicles(parsedVehicles);
          return; // Skip API call if we have fresh cache
        }
      }
    } catch (error) {
      console.error('Error loading cached vehicles:', error);
    }
  }, [user?.sub, cacheKey]);

  // Fetch vehicles for the authenticated transporter using useCallback to prevent infinite loops
  const fetchVehicles = useCallback(async () => {
    if (!user?.sub) return;
    
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      
      // Add timeout and better error handling for faster perceived performance
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await axios.get(`http://localhost:5000/api/vehicles?transporterId=${user.sub}`, {
        signal: controller.signal,
        timeout: 10000 // Additional axios timeout
      });
      
      clearTimeout(timeoutId);
      const vehicleData = response.data || [];
      setVehicles(vehicleData);
      
      // Cache the results for faster subsequent loads
      try {
        localStorage.setItem(cacheKey, JSON.stringify(vehicleData));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        console.log('📦 Vehicles cached successfully');
      } catch (error) {
        console.error('Error caching vehicles:', error);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.error('Request timed out');
        setError('Request timed out. Please check your connection and try again.');
      } else {
        console.error('Error fetching vehicles:', err);
        setError('Failed to load vehicles. Please try again.');
      }
      setVehicles([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [user?.sub, cacheKey]); // Add cacheKey to dependencies

  // Only fetch when user is authenticated and we have the user ID
  // Add debounce to prevent multiple API calls
  useEffect(() => {
    if (!isAuthenticated || !user?.sub || isLoading) return;
    
    const timeoutId = setTimeout(() => {
      fetchVehicles();
    }, 100); // Small debounce to prevent rapid API calls
    
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user?.sub, isLoading, fetchVehicles]);

  // Handle form submission for adding/editing vehicles - memoized to prevent re-creation
  const handleSubmit = useCallback(async () => {
    if (!user?.sub) return;
    
    try {
      setError(''); // Clear any previous errors
      const vehicleData = new FormData();
      vehicleData.append('vehicleType', formData.vehicleType);
      vehicleData.append('licensePlate', formData.licensePlate);
      vehicleData.append('loadCapacity', formData.loadCapacity);
      vehicleData.append('pricePerKm', formData.pricePerKm);
      vehicleData.append('district', formData.location); // Backend expects 'district'
      vehicleData.append('transporterId', user.sub); // Backend expects 'transporterId'
      
      if (formData.image) {
        vehicleData.append('vehicleImage', formData.image); // Backend expects 'vehicleImage'
      }

      let response;
      if (editingVehicle) {
        // Update existing vehicle
        response = await axios.put(`http://localhost:5000/api/vehicles/${editingVehicle._id}`, vehicleData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Add new vehicle
        response = await axios.post('http://localhost:5000/api/vehicles', vehicleData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.status === 200 || response.status === 201) {
        setOpenDialog(false);
        setEditingVehicle(null);
        resetForm();
        
        // Clear cache when vehicles are modified
        try {
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(`${cacheKey}_timestamp`);
        } catch (error) {
          console.error('Error clearing cache:', error);
        }
        
        fetchVehicles();
      }
    } catch (err) {
      console.error('Error saving vehicle:', err);
      setError(err.response?.data?.message || 'Failed to save vehicle');
    }
  }, [formData, editingVehicle, user?.sub, fetchVehicles, resetForm, cacheKey]); // Add dependencies

  // Handle vehicle deletion - memoized to prevent re-creation
  const handleDelete = useCallback(async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    
    try {
      setError(''); // Clear any previous errors
      await axios.delete(`http://localhost:5000/api/vehicles/${vehicleId}`);
      
      // Clear cache when vehicles are modified
      try {
        localStorage.removeItem(cacheKey);
        localStorage.removeItem(`${cacheKey}_timestamp`);
      } catch (error) {
        console.error('Error clearing cache:', error);
      }
      
      fetchVehicles();
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      setError('Failed to delete vehicle');
    }
  }, [fetchVehicles, cacheKey]);

  // Open dialog for editing - memoized to prevent re-creation
  const handleEdit = useCallback((vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleType: vehicle.vehicleType || '',
      licensePlate: vehicle.licensePlate || '',
      loadCapacity: vehicle.loadCapacity || '',
      pricePerKm: vehicle.pricePerKm || '',
      location: vehicle.district || vehicle.location || '', // Handle both district and location fields
      image: null
    });
    setOpenDialog(true);
  }, []);

  // Memoize handlers to prevent unnecessary re-renders
  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingVehicle(null);
    resetForm();
  }, [resetForm]);

  const handleClearError = useCallback(() => {
    setError('');
  }, []);

  // Early returns for loading and authentication states
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">Please log in to manage your vehicles</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 700 }}>
              <TruckIcon sx={{ mr: 2, fontSize: 32 }} />
              Manage Your Vehicles
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Add, edit, or remove your vehicle listings
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={handleClearError}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Grid container spacing={3} justifyContent="flex-start">
          {/* Show skeleton cards while loading */}
          {[1, 2, 3].map((index) => (
            <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
              <VehicleCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {/* Vehicles Grid */}
          {vehicles.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 2 }}>
              <TruckIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
              <Typography variant="h5" gutterBottom color="text.secondary">
                No Vehicles Listed
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                You have no vehicles listed on the platform
              </Typography>

            </Paper>
          ) : (
            <Grid container spacing={3} justifyContent="flex-start">

              {vehicles.map((vehicle) => (
                <Grid item xs={12} sm={6} md={4} key={vehicle._id} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <VehicleCard 
                    vehicle={vehicle}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Add/Edit Vehicle Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#1976d2',
          color: 'white'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </Typography>
          <IconButton
            onClick={handleCloseDialog}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vehicle Type"
                value={formData.vehicleType}
                onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                placeholder="e.g., Truck, Van, Lorry"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="License Plate"
                value={formData.licensePlate}
                onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                placeholder="e.g., ABC-1234"
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Load Capacity (kg)"
                type="number"
                value={formData.loadCapacity}
                onChange={(e) => handleInputChange('loadCapacity', e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">kg</InputAdornment>
                }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Price per Km"
                type="number"
                value={formData.pricePerKm}
                onChange={(e) => handleInputChange('pricePerKm', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">LKR</InputAdornment>
                }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location/District"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Colombo, Kandy"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CarIcon />}
                sx={{ py: 1.5 }}
              >
                Upload Vehicle Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleInputChange('image', e.target.files[0])}
                />
              </Button>
              {formData.image && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Selected: {formData.image.name}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderColor: '#666', color: '#666' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ backgroundColor: '#1976d2' }}
            disabled={!formData.vehicleType || !formData.licensePlate || !formData.loadCapacity || !formData.pricePerKm || !formData.location}
          >
            {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default memo(EditListed);