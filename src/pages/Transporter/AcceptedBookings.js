import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getBookingsForTransporter } from "../../services/api";
import axios from "axios";
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Divider,
  Avatar,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Inventory as InventoryIcon,
  Scale as WeightIcon,
  CheckCircle as CheckIcon,
  OpenInNew as OpenIcon,
  Route as RouteIcon,
  Done as CompletedIcon
} from '@mui/icons-material';

export const formatPickupLocations = (selectedItems) => {
  if (!selectedItems || selectedItems.length === 0) {
    return "Pick-up Locations:\nNo items selected.";
  }
  
  let output = "Pick-up Locations:\n";
  
  selectedItems.forEach((item, index) => {
    const itemName = item.name || item.item || item.productName || "Unknown Item";
    const location = item.pickupLocation || item.location || "Location not available";
    output += `${index + 1}. ${itemName} - ${location}\n`;
  });
  
  return output.trim();
};

const AcceptedBookings = () => {
  const { user } = useAuth0();
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const fetchAcceptedBookings = async () => {
      setLoading(true);
      try {
        const allBookings = await getBookingsForTransporter(user.sub);
        // Filter only confirmed bookings (exclude completed ones)
        const confirmed = allBookings.filter(booking => 
          booking.status === 'confirmed'
        );
        setAcceptedBookings(confirmed);
      } catch (error) {
        console.error('Error fetching accepted bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.sub) fetchAcceptedBookings();
  }, [user]);

  // Function to open individual pickup location in Google Maps
  const openLocationInMaps = (location) => {
    if (!location || location === 'Location not available') {
      alert('Location not available');
      return;
    }
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(location)}`;
    window.open(mapsUrl, '_blank');
  };

  // Function to mark booking as completed
  const handleCompleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to mark this booking as completed?')) {
      return;
    }
    
    try {
      console.log('✅ Attempting to complete booking:', bookingId);
      console.log('✅ Request URL:', `http://localhost:5000/api/bookings/${bookingId}/complete`);
      
      const response = await axios.put(`http://localhost:5000/api/bookings/${bookingId}/complete`);
      console.log('📋 Completion response:', response.data);
      console.log('📋 Response status:', response.status);
      
      if (response.data.success) {
        // Remove the booking from the local state since it's now completed
        setAcceptedBookings(prevBookings => 
          prevBookings.filter(booking => booking._id !== bookingId)
        );
        
        alert('Booking marked as completed successfully!');
        console.log('✅ Booking completed successfully');
      } else {
        console.error('❌ Completion failed - no success flag in response');
        console.error('❌ Full response:', response.data);
        alert('Failed to complete booking. Server response: ' + JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('❌ Error completing booking:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      });
      
      let errorMessage = 'Failed to complete booking. ';
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.response?.data?.details) {
        errorMessage += error.response.data.details;
      } else if (error.response?.status) {
        errorMessage += `Server error: ${error.response.status} - ${error.response.statusText}`;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert(errorMessage);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      'confirmed': { color: 'success', label: 'Confirmed', icon: <CheckIcon /> },
      'completed': { color: 'primary', label: 'Completed', icon: <CompletedIcon /> }
    };
    
    const config = statusConfig[status] || statusConfig['confirmed'];
    return (
      <Chip 
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="filled"
        sx={{ fontWeight: 600 }}
      />
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
          color: 'white',
          p: 4
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <CheckIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Accepted Bookings
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Manage your confirmed transport bookings
                </Typography>
              </Box>
          </Box>
        </Box>
          
          {/* Stats */}
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(5px)'
              }}>
                <Typography variant="h3" fontWeight={700}>
                  {acceptedBookings.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Active Bookings
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(5px)'
              }}>
                <Typography variant="h3" fontWeight={700}>
                  {acceptedBookings.filter(b => b.status === 'confirmed').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Ready to Complete
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Content */}
        <Box sx={{ p: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>
                Loading accepted bookings...
              </Typography>
            </Box>
          ) : acceptedBookings.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderRadius: 3,
              color: 'text.secondary'
            }}>
              <CheckIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5, color: '#4caf50' }} />
              <Typography variant="h5" gutterBottom fontWeight={600}>
                No Accepted Bookings Found
              </Typography>
              <Typography variant="body1" sx={{ maxWidth: 400, mx: 'auto' }}>
                You don't have any accepted bookings yet. When you accept vehicle bookings, they'll appear here.
              </Typography>
            </Box>
          ) : (
            <Box>
              {acceptedBookings.map((booking, index) => (
                <Box key={booking._id} sx={{ mb: 3 }}>
                  <Fade in={true} timeout={300 + index * 100}>
                    <Card 
                      elevation={2}
                      sx={{ 
                        borderRadius: 3,
                        border: '1px solid #e0e0e0',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                          borderColor: '#4caf50'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                            <Avatar sx={{ bgcolor: '#4caf50', width: 48, height: 48 }}>
                              <PersonIcon />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" fontWeight={600} color="primary">
                                {booking.merchantDetails?.name || booking.merchantName || 'Merchant'}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {booking.merchantDetails?.phone || booking.merchantPhone || 'No phone provided'}
                                </Typography>
                              </Box>
                              {booking.merchantDetails?.email && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {booking.merchantDetails.email}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {getStatusChip(booking.status)}
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={3}>
                          {/* Route Information */}
                          <Grid item xs={12}>
                            <Box sx={{ 
                              p: 3, 
                              bgcolor: 'rgba(76, 175, 80, 0.05)', 
                              borderRadius: 2,
                              border: '1px solid rgba(76, 175, 80, 0.1)'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <RouteIcon color="success" />
                                <Typography variant="subtitle1" fontWeight={600} color="success.main">
                                  Route Details
                                </Typography>
                              </Box>
                              
                              {/* Start Locations */}
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <LocationIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    <strong>Pick-up Locations:</strong>
                                  </Typography>
                                </Box>
                                {(() => {
                                  const pickupLocations = [];
                                  
                                  if (booking.selectedItems && Array.isArray(booking.selectedItems)) {
                                    booking.selectedItems.forEach(selectedItem => {
                                      const itemName = selectedItem.name || selectedItem.item || selectedItem.productName || 'Selected item';
                                      const location = selectedItem.location || selectedItem.pickupLocation || 'Location not available';
                                      pickupLocations.push(`${itemName} - ${location}`);
                                    });
                                  } else if (booking.items && booking.startLocation) {
                                    const items = booking.items.split(/[,]/).map(item => item.trim()).filter(item => item);
                                    
                                    if (booking.startLocation.includes('Multiple Pickup Locations:')) {
                                      const locationLines = booking.startLocation
                                        .replace('Multiple Pickup Locations:\n', '')
                                        .split('\n')
                                        .filter(line => line.trim());
                                      
                                      locationLines.forEach(line => {
                                        pickupLocations.push(line.trim());
                                      });
                                    } else {
                                      items.forEach(item => {
                                        pickupLocations.push(`${item} - ${booking.startLocation}`);
                                      });
                                    }
                                  } else {
                                    pickupLocations.push('Selected item - Location not available');
                                  }
                                  
                                  return pickupLocations.map((locationInfo, index) => (
                                    <Box 
                                      key={index}
                                      sx={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        ml: 2, 
                                        mb: 0.5,
                                        pl: 2,
                                        py: 0.5,
                                        borderLeft: '2px solid #4caf50',
                                        backgroundColor: index % 2 === 0 ? 'rgba(76, 175, 80, 0.05)' : 'transparent',
                                        borderRadius: '4px',
                                      }}
                                    >
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          flex: 1,
                                          wordWrap: 'break-word',
                                          whiteSpace: 'normal'
                                        }}
                                        title={locationInfo}
                                      >
                                        {`${index + 1}. ${locationInfo}`}
                                      </Typography>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<OpenIcon />}
                                        onClick={() => {
                                          const location = locationInfo.split(' - ')[1];
                                          openLocationInMaps(location);
                                        }}
                                        sx={{ 
                                          minWidth: 'auto',
                                          px: 1,
                                          fontSize: '0.75rem'
                                        }}
                                      >
                                        Maps
                                      </Button>
                                    </Box>
                                  ));
                                })()}
                              </Box>

                              {/* End Location */}
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LocationIcon sx={{ fontSize: 16, color: '#f44336' }} />
                                  <Typography variant="body2">
                                    <strong>Destination:</strong> {booking.endLocation || 'Not specified'}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Grid>

                          {/* Harvest Details */}
                          <Grid item xs={12}>
                            <Box sx={{ 
                              p: 3, 
                              bgcolor: 'rgba(25, 118, 210, 0.05)', 
                              borderRadius: 2,
                              border: '1px solid rgba(25, 118, 210, 0.1)'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <InventoryIcon color="primary" />
                                <Typography variant="subtitle1" fontWeight={600} color="primary">
                                  Harvest Details
                                </Typography>
                              </Box>
                              
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <InventoryIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                    <Typography variant="body2">
                                      <strong>Items:</strong> {booking.items || 'Not specified'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <WeightIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                    <Typography variant="body2">
                                      <strong>Weight:</strong> {booking.weight || 'N/A'} Kg
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Actions */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                          {booking.status === 'confirmed' ? (
                            <Button 
                              variant="contained" 
                              color="primary"
                              startIcon={<CompletedIcon />}
                              onClick={() => handleCompleteBooking(booking._id)}
                              sx={{ minWidth: 160 }}
                            >
                              Mark as Completed
                            </Button>
                          ) : (
                            <Chip 
                              label="Booking Completed"
                              color="primary"
                              variant="filled"
                              sx={{ 
                                fontSize: '1rem', 
                                px: 3, 
                                py: 1,
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default AcceptedBookings;
