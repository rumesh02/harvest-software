import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";
import "./TransporterDashboard.css";
import api from "../../services/api"; // Use your configured axios instance
import { getVehicles } from "../../services/api"; // Import the getVehicles function
import { useAuth0 } from "@auth0/auth0-react";
import { 
  Box, 
  Typography, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Divider, 
  Button,
  Chip,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { 
  LocalShipping as ShippingIcon,
  DirectionsCar as VehicleIcon,
  Person as DriverIcon,
  Assignment as BookingIcon
} from '@mui/icons-material';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TransporterDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    monthlyData: [],
    topDrivers: []
  });
  const [vehicleCount, setVehicleCount] = useState(0);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user || !user.sub) return;
      try {
        setLoading(true);
        const res = await api.get(`/dashboard/transporter/${user.sub}`);
        console.log("Dashboard data:", res.data);
        setDashboardData(res.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchVehicleCount = async () => {
      if (!user || !user.sub) return;
      try {
        setLoadingVehicles(true);
        const vehicles = await getVehicles(user.sub);
        setVehicleCount(vehicles.length);
      } catch (err) {
        console.error("Vehicle count fetch error:", err);
        setVehicleCount(0);
      } finally {
        setLoadingVehicles(false);
      }
    };

    const fetchTopDrivers = async () => {
      if (!user || !user.sub) return;
      try {
        setLoadingDrivers(true);
        
        // 🚛 Use the new Top Transporters API endpoint
        const response = await api.get('/dashboard/top-transporters', {
          params: {
            limit: 10
            // Removed status filter to include all bookings regardless of status
          }
        });
        
        console.log("Fetched top transporters:", response.data);
        
        if (response.data.success && response.data.data.topTransporters) {
          setDashboardData(prev => ({ 
            ...prev, 
            topDrivers: response.data.data.topTransporters 
          }));
        } else {
          console.log("No top transporters found in response");
          setDashboardData(prev => ({ ...prev, topDrivers: [] }));
        }
        
      } catch (err) {
        console.error("Top transporters fetch error:", err);
        // Fallback to the existing implementation if new API fails
        try {
          const bookingsRes = await api.get(`/bookings/transporter/${user.sub}`);
          const bookings = bookingsRes.data.bookings || bookingsRes.data || [];
          
          console.log("Fallback: Fetched bookings for transporter:", bookings);
          
          // Group bookings by driver and count them
          const driverBookingCounts = {};
          const driverDetails = {};
          
          bookings.forEach(booking => {
            const driverId = booking.driverId || booking.driver_id || booking.assignedDriver;
            const driverName = booking.driverName || booking.driver_name || booking.driverDetails?.name;
            const driverPhone = booking.driverPhone || booking.driver_phone || booking.driverDetails?.phone;
            const driverPicture = booking.driverPicture || booking.driver_picture || booking.driverDetails?.picture;
            const vehicleType = booking.vehicleType || booking.vehicle_type || booking.vehicleDetails?.type;
            
            if (driverId) {
              // Count bookings per driver
              driverBookingCounts[driverId] = (driverBookingCounts[driverId] || 0) + 1;
              
              // Store driver details (latest info will overwrite)
              driverDetails[driverId] = {
                driverId: driverId,
                transporterId: driverId, // Add for consistency
                name: driverName || `Driver ${driverId.slice(-4)}`,
                phone: driverPhone,
                profilePicture: driverPicture,
                vehicleType: vehicleType,
                bookingCount: driverBookingCounts[driverId]
              };
            }
          });
          
          // Convert to array and sort by booking count
          const topDriversArray = Object.values(driverDetails)
            .map(driver => ({
              ...driver,
              bookingCount: driverBookingCounts[driver.driverId] || 0
            }))
            .sort((a, b) => b.bookingCount - a.bookingCount)
            .slice(0, 10); // Get top 10 drivers
          
          setDashboardData(prev => ({ ...prev, topDrivers: topDriversArray }));
          
        } catch (fallbackErr) {
          console.error("Fallback drivers fetch error:", fallbackErr);
          setDashboardData(prev => ({ ...prev, topDrivers: [] }));
        }
      } finally {
        setLoadingDrivers(false);
      }
    };

    fetchDashboard();
    fetchVehicleCount();
    fetchTopDrivers();
  }, [user]);

  // Enhanced stat card data matching farmer dashboard style
  const statCards = [
    {
      title: "Total Bookings",
      value: dashboardData.totalBookings !== undefined ? dashboardData.totalBookings : 0,
      icon: <BookingIcon fontSize="small" />,
      bgColor: "#e3f2fd",
      color: "#1565c0"
    },
    {
      title: "Listed Vehicles",
      value: loadingVehicles ? "Loading..." : vehicleCount,
      icon: <VehicleIcon fontSize="small" />,
      bgColor: "#e3f2fd",
      color: "#1565c0"
    }
  ];

  // Prepare chart data
  const chartData = {
    labels: dashboardData.monthlyData.map(m => m.name),
    datasets: [
      {
        label: "Orders",
        data: dashboardData.monthlyData.map(m => m.orders),
        backgroundColor: "#1976d2",
        borderRadius: 5,
        borderSkipped: false
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { beginAtZero: true },
      y: { beginAtZero: true }
    }
  };

  // Check if we have any data to display
  const hasData = dashboardData.totalBookings > 0 || vehicleCount > 0 || (dashboardData.monthlyData && dashboardData.monthlyData.length > 0);

  if (loading && loadingVehicles && loadingDrivers) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        background: '#f9f9f9'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#1976d2', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading Dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: '#f9f9f9',
      minHeight: "100vh",
      py: 3
    }}>
      <Box sx={{ 
        maxWidth: 1400, 
        mx: "auto", 
        px: { xs: 2, md: 3 }
      }}>
        {/* Header Section */}
        <Box sx={{ mb: { xs: 2, md: 3 }, textAlign: 'center' }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1565c0',
              mb: 0.5,
              fontSize: { xs: 22, md: 24 }
            }}
          >
            Transporter Dashboard
          </Typography>
          <Typography variant="body2" color="#1565c0" sx={{ fontWeight: 400, fontSize: { xs: 15, md: 16 } }}>
            Manage your transport operations and track performance
          </Typography>
        </Box>

        {/* Enhanced Stats Cards */}
        <Grid container spacing={{ xs: 2.5, md: 4 }} sx={{ mb: { xs: 2, md: 4 } }}>
          {statCards.map((card, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 6 }} key={index}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  background: card.bgColor,
                  borderRadius: 3,
                  color: card.color,
                  boxShadow: '0 1.5px 6px rgba(25, 118, 210, 0.07)',
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: 'relative',
                  overflow: 'hidden',
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 16px rgba(25, 118, 210, 0.13)"
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 }, pt: { xs: 2.5, md: 3.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="subtitle2" 
                        color="#1565c0" 
                        gutterBottom
                        sx={{ fontWeight: 500, mb: 1, fontSize: { xs: 15, md: 16 } }}
                      >
                        {card.title}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ 
                          fontWeight: 700,
                          color: card.color,
                          fontSize: { xs: 22, md: 26 }
                        }}
                      >
                        {card.value}
                      </Typography>
                    </Box>
                    <Avatar 
                      sx={{ 
                        background: '#e3f2fd',
                        color: '#1565c0',
                        width: 44,
                        height: 44,
                        boxShadow: '0 1.5px 6px rgba(25, 118, 210, 0.10)',
                        fontSize: 24
                      }}
                    >
                      {card.icon}
                    </Avatar>
                  </Box>
                  {index === 1 && !loadingVehicles && (
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="outlined"
                        size="small"
                        onClick={() => navigate("/transporter/editListed")}
                        sx={{
                          color: '#1565c0',
                          borderColor: '#1565c0',
                          fontSize: '0.8rem',
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor: '#1565c0',
                            color: '#fff'
                          }
                        }}
                      >
                        Manage Vehicles
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Enhanced Charts and Lists */}
        {!hasData && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8, 
            mb: 4,
            background: 'rgba(255,255,255,0.8)',
            borderRadius: 3,
            backdropFilter: 'blur(10px)'
          }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 3,
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShippingIcon sx={{ color: 'white', fontSize: 40 }} />
            </Box>
            <Typography variant="h5" color="#000" gutterBottom sx={{ fontWeight: 600 }}>
              No Transport Data Available Yet
            </Typography>
            <Typography variant="body1" color="#000" sx={{ maxWidth: 400, mx: 'auto' }}>
              Start managing your vehicles and bookings to see your transport analytics
            </Typography>
          </Box>
        )}

        <Grid container spacing={{ xs: 2.5, md: 4 }}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                height: '100%',
                background: 'rgba(255,255,255,0.9)',
                border: "1px solid #E5E7EB",
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                animation: 'slideDown 0.6s ease-out',
                '@keyframes slideDown': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(-30px)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1565c0', mb: 0.5, fontSize: { xs: 15, md: 17 } }}>
                    Monthly Orders Analytics
                  </Typography>
                  <Typography variant="body2" color="#1565c0" sx={{ fontSize: { xs: 12, md: 13 } }}>
                    Track your transport orders over time
                  </Typography>
                </Box>
                <Avatar 
                  sx={{ 
                    background: '#1976d2',
                    width: 40,
                    height: 40,
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.12)'
                  }}
                >
                  <BookingIcon fontSize="small" />
                </Avatar>
              </Box>
              <Box sx={{ height: 240, mt: 1.5 }}>
                <Bar data={chartData} options={chartOptions} />
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                height: '100%',
                background: 'rgba(255,255,255,0.9)',
                border: "1px solid #E5E7EB",
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1565c0', mb: 0.5, fontSize: { xs: 15, md: 17 } }}>
                    Top Drivers
                  </Typography>
                  <Typography variant="body2" color="#1565c0" sx={{ fontSize: { xs: 12, md: 13 } }}>
                    Your most active transport partners
                  </Typography>
                </Box>
                <Avatar 
                  sx={{ 
                    background: '#1976d2',
                    width: 40,
                    height: 40,
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.12)'
                  }}
                >
                  <DriverIcon fontSize="small" />
                </Avatar>
              </Box>
              
              {loadingDrivers ? (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                  <CircularProgress size={30} sx={{ color: '#1976d2', mr: 2 }} />
                  <Typography variant="body2" color="#666">Loading drivers...</Typography>
                </Box>
              ) : (
                <Box sx={{ height: 240, mt: 1.5 }}>
                  {dashboardData.topDrivers.length === 0 ? (
                    <Box sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      background: '#f8fffe',
                      borderRadius: 2,
                      border: '1px dashed #e3f2fd'
                    }}>
                      <DriverIcon sx={{ fontSize: 48, color: '#1565c0', mb: 2, opacity: 0.6 }} />
                      <Typography color="#1565c0" sx={{ fontWeight: 600, fontSize: 16, mb: 1 }}>
                        No drivers found yet
                      </Typography>
                      <Typography variant="body2" color="#1976d2" sx={{ maxWidth: 200 }}>
                        Start assigning bookings to drivers to see performance analytics
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ height: '100%', overflowY: 'auto' }}>
                      <List sx={{ width: '100%', p: 0 }}>
                        {dashboardData.topDrivers.slice(0, 5).map((driver, index) => (
                          <React.Fragment key={driver.driverId || driver.transporterId || index}>
                            {index > 0 && <Divider component="li" sx={{ my: 1 }} />}
                            <ListItem 
                              sx={{ 
                                px: 2, 
                                py: 2, 
                                borderRadius: 2, 
                                transition: 'all 0.3s ease',
                                '&:hover': { 
                                  bgcolor: '#e3f2fd',
                                  transform: 'translateX(4px)'
                                } 
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar 
                                  src={driver.profilePicture || driver.picture || undefined}
                                  alt={driver.name}
                                  sx={{ 
                                    width: 38, 
                                    height: 38, 
                                    bgcolor: !driver.profilePicture && !driver.picture ? '#1976d2' : undefined,
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: 16,
                                    border: '2px solid #e3f2fd',
                                    boxShadow: '0 1.5px 6px rgba(25, 118, 210, 0.07)'
                                  }}
                                >
                                  {(!driver.profilePicture && !driver.picture) && driver.name ? 
                                    driver.name[0].toUpperCase() : 
                                    <DriverIcon fontSize="small" />
                                  }
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1565c0', fontSize: { xs: 15, md: 16 } }}>
                                    {driver.name || `Driver ${(driver.driverId || driver.transporterId || '').slice(-4)}`}
                                  </Typography>
                                }
                                secondary={
                                  <>
                                    {(driver.phone || driver.contactNumber) && (
                                      <Typography variant="caption" color="#1976d2" sx={{ mt: 0.5, display: 'block' }}>
                                        📱 {driver.phone || driver.contactNumber}
                                      </Typography>
                                    )}
                                    {driver.vehicleType && (
                                      <Typography variant="caption" color="#1565c0" sx={{ display: 'block', fontWeight: 500 }}>
                                        🚛 {driver.vehicleType}
                                      </Typography>
                                    )}
                                  </>
                                }
                              />
                              <Chip
                                label={`${driver.bookingCount || 0} bookings`}
                                sx={{
                                  background: '#e3f2fd',
                                  color: '#1565c0',
                                  fontWeight: 600,
                                  fontSize: 13,
                                  boxShadow: '0 1.5px 6px rgba(25, 118, 210, 0.07)'
                                }}
                              />
                            </ListItem>
                          </React.Fragment>
                        ))}
                      </List>
                      
                      {/* View All Button */}
                      {dashboardData.topDrivers.length > 5 && (
                        <Box sx={{ textAlign: 'center', mt: 2, pt: 1, borderTop: '1px solid #f0f0f0' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate("/transporter/drivers")}
                            sx={{
                              color: '#1565c0',
                              borderColor: '#1565c0',
                              fontSize: '0.75rem',
                              textTransform: 'none',
                              fontWeight: 600,
                              '&:hover': {
                                bgcolor: '#1565c0',
                                color: '#fff'
                              }
                            }}
                          >
                            View All Drivers ({dashboardData.topDrivers.length})
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

function TransporterDashboardWrapper() {
  const { user } = useAuth0();
  return <TransporterDashboard user={user} />;
}

export default TransporterDashboardWrapper;
