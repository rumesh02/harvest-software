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
  Alert,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
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
  Notifications as NotificationsIcon,
  Route as RouteIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Assignment as BookingIcon,
  Map as MapIcon
} from '@mui/icons-material';

const Bookings = () => {
  const { user } = useAuth0();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Debug function to check notifications
  const checkNotifications = async () => {
    setNotificationLoading(true);
    try {
      const transporterId = user?.sub;
      console.log('🔍 Checking notifications for transporter:', transporterId);
      console.log('🔍 Transporter ID type:', typeof transporterId);
      
      const response = await axios.get(`http://localhost:5000/api/notifications/${transporterId}`);
      console.log('📋 All transporter notifications:', response.data);
      
      const unreadResponse = await axios.get(`http://localhost:5000/api/notifications/unread/${transporterId}`);
      console.log('🔔 Unread count:', unreadResponse.data.unreadCount);
      
      // Show the latest 3 notifications
      const latest = response.data.slice(0, 3);
      console.log('📄 Latest 3 notifications:', latest);
      
      // Check specifically for vehicle bookings
      const vehicleBookings = response.data.filter(n => n.type === 'vehicle_booked');
      console.log('🚚 Vehicle booking notifications:', vehicleBookings);
      
      if (response.data.length === 0) {
        alert(`No notifications found for transporter ID: ${transporterId}. Try booking a vehicle from merchant account first.`);
      } else {
        alert(`Found ${response.data.length} notifications (${unreadResponse.data.unreadCount} unread). Vehicle bookings: ${vehicleBookings.length}. Check console for details.`);
      }
    } catch (error) {
      console.error('❌ Error checking notifications:', error);
      alert('Failed to check notifications');
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await getBookingsForTransporter(user.sub);
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.sub) fetchBookings();
  }, [user]);

  // Function to open Google Maps with route
  const openGoogleMaps = (startLocation, endLocation) => {
    if (!startLocation || !endLocation) {
      alert('Start or end location is missing');
      return;
    }

    // Handle multiple start locations
    const startLocations = startLocation.split(/[,;]/).map(loc => loc.trim()).filter(loc => loc);
    
    if (startLocations.length === 1) {
      // Single location - direct route
      const mapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(startLocations[0])}/${encodeURIComponent(endLocation)}`;
      window.open(mapsUrl, '_blank');
    } else if (startLocations.length > 1) {
      // Multiple locations - create waypoint route
      const origin = encodeURIComponent(startLocations[0]);
      const destination = encodeURIComponent(endLocation);
      const waypoints = startLocations.slice(1).map(loc => encodeURIComponent(loc)).join('|');
      
      const mapsUrl = `https://www.google.com/maps/dir/${origin}/${waypoints}/${destination}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      'pending': { color: 'warning', label: 'Pending', icon: <ScheduleIcon /> },
      'confirmed': { color: 'success', label: 'Confirmed', icon: <CheckIcon /> },
      'completed': { color: 'primary', label: 'Completed', icon: <CheckIcon /> },
      'cancelled': { color: 'error', label: 'Cancelled', icon: <ScheduleIcon /> }
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
                  Vehicle Bookings
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Manage your transport booking requests
                </Typography>
              </Box>
            </Box>
            
            <Button
              variant="contained"
              onClick={checkNotifications}
              disabled={notificationLoading}
              startIcon={notificationLoading ? <CircularProgress size={20} color="inherit" /> : <NotificationsIcon />}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                },
                minWidth: 180
              }}
            >
              {notificationLoading ? 'Checking...' : 'Check Notifications'}
            </Button>
          </Box>
          
          {/* Stats */}
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
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
                  Total Bookings
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ 
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(5px)'
              }}>
                <Typography variant="h3" fontWeight={700}>
                  {bookings.filter(b => b.status === 'confirmed').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Confirmed
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
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
                  Pending
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
                No Bookings Found
              </Typography>
              <Typography variant="body1" sx={{ maxWidth: 400, mx: 'auto' }}>
                You don't have any vehicle bookings yet. When merchants book your vehicles, they'll appear here.
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
                              bgcolor: 'rgba(25, 118, 210, 0.05)', 
                              borderRadius: 2,
                              border: '1px solid rgba(25, 118, 210, 0.1)'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <RouteIcon color="primary" />
                                <Typography variant="subtitle1" fontWeight={600} color="primary">
                                  Route Details
                                </Typography>
                              </Box>
                              
                              {/* Start Locations - Handle multiple locations */}
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                  <LocationIcon sx={{ fontSize: 16, color: '#4caf50', mr: 1 }} />
                                  <strong>Pick-up Locations:</strong>
                                </Typography>
                                {(() => {
                                  const startLocations = booking.startLocation ? 
                                    booking.startLocation.split(/[,;]/).map(loc => loc.trim()).filter(loc => loc) : 
                                    ['Not specified'];
                                  
                                  return startLocations.map((location, index) => (
                                    <Typography 
                                      key={index} 
                                      variant="body2" 
                                      sx={{ 
                                        ml: 3, 
                                        mb: 0.5,
                                        pl: 2,
                                        py: 0.5,
                                        borderLeft: '2px solid #4caf50',
                                        backgroundColor: index % 2 === 0 ? 'rgba(76, 175, 80, 0.05)' : 'transparent',
                                        borderRadius: '4px',
                                        display: 'block',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}
                                      title={location} // Show full address on hover
                                    >
                                      {startLocations.length > 1 ? `${index + 1}. ${location}` : location}
                                    </Typography>
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

                          {/* Harvest Details - Full Width Second Row */}
                          <Grid item xs={12}>
                            <Box sx={{ 
                              p: 3, 
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
                          <Button 
                            variant="outlined"
                            color="primary"
                            startIcon={<MapIcon />}
                            onClick={() => openGoogleMaps(booking.startLocation, booking.endLocation)}
                            sx={{ minWidth: 160 }}
                          >
                            Open in Maps
                          </Button>
                          <Button 
                            variant="contained" 
                            color="primary"
                            startIcon={<CheckIcon />}
                            sx={{ minWidth: 160 }}
                          >
                            Accept Booking
                          </Button>
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
