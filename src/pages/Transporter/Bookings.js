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
  LocalShipping as TruckIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Inventory as InventoryIcon,
  Scale as WeightIcon,
  Route as RouteIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Assignment as BookingIcon,
  Cancel as RejectIcon,
  OpenInNew as OpenIcon
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

const Bookings = () => {
  const { user } = useAuth0();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const allBookings = await getBookingsForTransporter(user.sub);
        // Filter only pending bookings (exclude confirmed, completed, and cancelled)
        const pendingBookings = allBookings.filter(booking => 
          booking.status === 'pending'
        );
        setBookings(pendingBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.sub) fetchBookings();
  }, [user]);

  // Function to open individual pickup location in Google Maps with red marker
  const openLocationInMaps = (location) => {
    if (!location || location === 'Location not available') {
      alert('Location not available');
      return;
    }
    // Create URL that shows the location with a red marker using the place search
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(location)}`;
    window.open(mapsUrl, '_blank');
  };

  // Function to open destination location in Google Maps with red marker
  const openDestinationInMaps = (location) => {
    if (!location || location === 'Location not available' || location === 'Not specified') {
      alert('Destination location not available');
      return;
    }
    // Create URL that shows the location with a red marker using the place search
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(location)}`;
    window.open(mapsUrl, '_blank');
  };

  // Function to handle booking acceptance
  const handleAcceptBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to accept this booking?')) {
      return;
    }
    
    try {
      console.log('✅ Attempting to accept booking:', bookingId);
      const response = await axios.put(`http://localhost:5000/api/bookings/${bookingId}/accept`);
      console.log('📋 Acceptance response:', response.data);
      
      if (response.data.success) {
        // Get booking details for merchant notification testing
        const booking = response.data.booking;
        console.log('📦 Booking details:', booking);
        console.log('🏪 Merchant ID from booking:', booking.merchantId);
        
        // Remove the booking from the local state since it's now confirmed
        setBookings(prevBookings => 
          prevBookings.filter(booking => booking._id !== bookingId)
        );
        
        alert(`Booking accepted successfully! Notification sent to merchant ${booking.merchantName}`);
        console.log('✅ Booking accepted successfully');
        console.log('📧 Merchant notification should be created for:', booking.merchantId);
      } else {
        console.error('❌ Acceptance failed - no success flag in response');
        alert('Failed to accept booking. Server response: ' + JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('❌ Error accepting booking:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      let errorMessage = 'Failed to accept booking. ';
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.response?.data?.details) {
        errorMessage += error.response.data.details;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert(errorMessage);
    }
  };

  // Function to handle booking rejection
  const handleRejectBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this booking?')) {
      return;
    }
    
    try {
      console.log('🔴 Attempting to reject booking:', bookingId);
      const response = await axios.put(`http://localhost:5000/api/bookings/${bookingId}/reject`);
      console.log('📋 Rejection response:', response.data);
      
      if (response.data.success) {
        // Get booking details for merchant notification testing
        const booking = response.data.booking;
        console.log('📦 Booking details:', booking);
        console.log('🏪 Merchant ID from booking:', booking.merchantId);
        
        // Remove the booking from the local state since it's now cancelled
        setBookings(prevBookings => 
          prevBookings.filter(booking => booking._id !== bookingId)
        );
        
        alert(`Booking rejected successfully! Notification sent to merchant ${booking.merchantName}`);
        console.log('✅ Booking rejected successfully');
        console.log('📧 Merchant notification should be created for:', booking.merchantId);
      } else {
        console.error('❌ Rejection failed - no success flag in response');
        alert('Failed to reject booking. Server response: ' + JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('❌ Error rejecting booking:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      let errorMessage = 'Failed to reject booking. ';
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.response?.data?.details) {
        errorMessage += error.response.data.details;
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
      'pending': { color: 'warning', label: 'Pending', icon: <ScheduleIcon /> },
      'confirmed': { color: 'success', label: 'Confirmed', icon: <CheckIcon /> },
      'completed': { color: 'primary', label: 'Completed', icon: <CheckIcon /> },
      'cancelled': { color: 'error', label: 'Rejected', icon: <RejectIcon /> }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    return (
      <Chip 
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          p: 4
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <TruckIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Pending Bookings
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Manage your new transport booking requests
                </Typography>
              </Box>
            </Box>
            
            {/* Info about notifications */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              bgcolor: 'rgba(255,255,255,0.1)',
              px: 2,
              py: 1,
              borderRadius: 1,
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                💡 Merchants will receive notifications when you accept/reject bookings
              </Typography>
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
                  {bookings.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Pending Requests
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
                  {bookings.filter(b => b.status === 'pending').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Awaiting Response
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
                Loading bookings...
              </Typography>
            </Box>
          ) : bookings.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderRadius: 3,
              color: 'text.secondary'
            }}>
              <BookingIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
              <Typography variant="h5" gutterBottom fontWeight={600}>
                No Pending Bookings Found
              </Typography>
              <Typography variant="body1" sx={{ maxWidth: 400, mx: 'auto' }}>
                You don't have any pending booking requests. When merchants book your vehicles, they'll appear here for you to accept or reject.
              </Typography>
            </Box>
          ) : (
            <Box>
              {bookings.map((booking, index) => (
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
                          borderColor: '#1976d2'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                            <Avatar sx={{ bgcolor: '#1976d2', width: 48, height: 48 }}>
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
                            {getStatusChip(booking.status || 'pending')}
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={3}>
                          {/* Route Information - Full Width First Row */}
                          <Grid item xs={12}>
                            <Box sx={{ 
                              p: 3, 
                              maxWidth: '100%',
                              bgcolor: 'rgba(25, 118, 210, 0.05)', 
                              borderRadius: 2,
                              border: '1px solid rgba(25, 118, 210, 0.1)',
                              mb: 2  // Added margin bottom for better spacing
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <RouteIcon color="primary" />
                                <Typography variant="subtitle1" fontWeight={600} color="primary">
                                  Route Details
                                </Typography>
                              </Box>
                              
                              {/* Start Locations - Handle multiple locations */}
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <LocationIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    <strong>Pick-up Locations:</strong>
                                  </Typography>
                                </Box>
                                {(() => {
                                  // Create pickup locations for selected items only
                                  const pickupLocations = [];
                                  
                                  // Check if booking has selectedItems data (the preferred structure)
                                  if (booking.selectedItems && Array.isArray(booking.selectedItems)) {
                                    // Use selectedItems array - each item should have name/item and location
                                    booking.selectedItems.forEach(selectedItem => {
                                      const itemName = selectedItem.name || selectedItem.item || selectedItem.productName || 'Selected item';
                                      const location = selectedItem.location || selectedItem.pickupLocation || 'Location not available';
                                      pickupLocations.push(`${itemName} - ${location}`);
                                    });
                                  } else if (booking.items && booking.startLocation) {
                                    // Fallback: Parse items and locations (legacy format)
                                    const items = booking.items.split(/[,]/).map(item => item.trim()).filter(item => item);
                                    
                                    // Check if startLocation contains structured data or simple location
                                    if (booking.startLocation.includes('Multiple Pickup Locations:')) {
                                      // Parse structured location data
                                      const locationLines = booking.startLocation
                                        .replace('Multiple Pickup Locations:\n', '')
                                        .split('\n')
                                        .filter(line => line.trim());
                                      
                                      locationLines.forEach(line => {
                                        if (line.includes('. ') && line.includes(' - ')) {
                                          // Extract item and location from format "1. ItemName - Location"
                                          const parts = line.split(' - ');
                                          if (parts.length >= 2) {
                                            const itemPart = parts[0].replace(/^\d+\.\s*/, ''); // Remove number prefix
                                            const locationPart = parts.slice(1).join(' - '); // Join remaining parts as location
                                            pickupLocations.push(`${itemPart} - ${locationPart}`);
                                          }
                                        }
                                      });
                                    } else {
                                      // Simple format: pair items with single location
                                      items.forEach(item => {
                                        pickupLocations.push(`${item} - ${booking.startLocation || 'Location not available'}`);
                                      });
                                    }
                                  } else {
                                    // Fallback for when no proper data is available
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
                                        title={locationInfo} // Show full info on hover
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
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <LocationIcon sx={{ fontSize: 16, color: '#f44336' }} />
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    <strong>Destination:</strong>
                                  </Typography>
                                </Box>
                                <Box sx={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  ml: 2, 
                                  pl: 2,
                                  py: 0.5,
                                  borderLeft: '2px solid #f44336',
                                  backgroundColor: 'rgba(244, 67, 54, 0.05)',
                                  borderRadius: '4px',
                                }}>
                                  <Typography 
                                    variant="body2"
                                    sx={{ 
                                      flex: 1,
                                      wordWrap: 'break-word',
                                      whiteSpace: 'normal'
                                    }}
                                    title={booking.endLocation || 'Not specified'}
                                  >
                                    {booking.endLocation || 'Not specified'}
                                  </Typography>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<OpenIcon />}
                                    onClick={() => {
                                      openDestinationInMaps(booking.endLocation);
                                    }}
                                    disabled={!booking.endLocation || booking.endLocation === 'Not specified'}
                                    sx={{ 
                                      minWidth: 'auto',
                                      px: 1,
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    Maps
                                  </Button>
                                </Box>
                              </Box>
                            </Box>
                          </Grid>

                          {/* Harvest Details - Full Width Second Row */}
                          <Grid item xs={12}>
                            <Box sx={{ 
                              p: 3, 
                              width: '100%',
                              bgcolor: 'rgba(76, 175, 80, 0.05)', 
                              borderRadius: 2,
                              border: '1px solid rgba(76, 175, 80, 0.1)'
                            }}>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <InventoryIcon color="success" />
                                <Typography variant="subtitle1" fontWeight={600} color="success.main">
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
                          {booking.status === 'pending' ? (
                            <>
                              <Button 
                                variant="outlined"
                                color="error"
                                startIcon={<RejectIcon />}
                                onClick={() => handleRejectBooking(booking._id)}
                                sx={{ minWidth: 160 }}
                              >
                                Reject Booking
                              </Button>
                              <Button 
                                variant="contained" 
                                color="success"
                                startIcon={<CheckIcon />}
                                onClick={() => handleAcceptBooking(booking._id)}
                                sx={{ minWidth: 160 }}
                              >
                                Accept Booking
                              </Button>
                            </>
                          ) : (
                            <Chip 
                              label={
                                booking.status === 'confirmed' ? 'Booking Confirmed' :
                                booking.status === 'cancelled' ? 'Booking Rejected' :
                                booking.status === 'completed' ? 'Booking Completed' : 
                                'Status Unknown'
                              }
                              color={
                                booking.status === 'confirmed' ? 'success' :
                                booking.status === 'cancelled' ? 'error' :
                                booking.status === 'completed' ? 'primary' : 
                                'default'
                              }
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

export default Bookings;
