import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Divider, 
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  ShoppingCart as OrdersIcon, 
  Gavel as BidsIcon, 
  AccountBalance as PaymentsIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MerchantDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    PendingPayments: "Rs. 0",
    PendingBids: 0,
    totalOrders: 0,
    monthlyData: [],
    topFarmers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth0();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user?.sub) return;
        
        // Encode the merchantId properly
        const encodedMerchantId = encodeURIComponent(user.sub);
        
        const response = await axios.get(
          `http://localhost:5000/api/merchant/dashboard/${encodedMerchantId}`
        );
        
        setDashboardData(response.data);
        
      } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Format the monthly data to ensure it has proper names and values
  const formattedMonthlyData = (dashboardData.monthlyData || []).map(item => ({
    name: item.name || item.month || '',
    revenue: typeof item.revenue === 'number' ? item.revenue : 0,
  }));

  const { PendingPayments, PendingBids, totalOrders, topFarmers } = dashboardData;

  // Stat card data with amber/gold theme
  const statCards = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <OrdersIcon />,
      color: "#ff8f00", // Amber
      bgColor: "#fff8e1" // Light amber
    },
    {
      title: "Pending Bids",
      value: PendingBids,
      icon: <BidsIcon />,
      color: "#f57c00", // Dark amber
      bgColor: "#ffecb3" // Light amber
    },
    {
      title: "Pending Payments",
      value: PendingPayments,
      icon: <PaymentsIcon />,
      color: "#ff6f00", // Deep amber
      bgColor: "#fffde7" // Very light amber
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Paper 
        elevation={0} 
        sx={{ 
          maxWidth: 1280, 
          mx: "auto", 
          p: { xs: 2, md: 3 }, 
          bgcolor: "#fff",
          border: "1px solid #e0e0e0"
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 600,
            color: "#2c3e50",
          }}
        >
          Merchant Dashboard
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {card.title}
                      </Typography>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 600, mt: 1 }}>
                        {card.value}
                      </Typography>
                    </Box>
                    <Avatar 
                      sx={{ 
                        bgcolor: card.bgColor, 
                        color: card.color,
                        width: 48,
                        height: 48
                      }}
                    >
                      {card.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts and Lists */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                height: '100%',
                border: "1px solid #e0e0e0",
                borderRadius: 1
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" color="#2c3e50" sx={{ fontWeight: 600 }}>
                  Monthly Harvest Purchases
                </Typography>
                <Avatar sx={{ bgcolor: '#f5f7fa', color: '#455a64' }}>
                  <TrendingIcon />
                </Avatar>
              </Box>
              
              <Box sx={{ height: 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formattedMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#546e7a', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#546e7a', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                      contentStyle={{
                        borderRadius: 4,
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="#455a64" 
                      radius={[4, 4, 0, 0]}
                      barSize={35}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                height: '100%',
                border: "1px solid #e0e0e0",
                borderRadius: 1
              }}
            >
              <Typography variant="h6" color="#2c3e50" sx={{ mb: 2, fontWeight: 600 }}>
                Top Farmers
              </Typography>
              
              {topFarmers && topFarmers.length > 0 ? (
                <List sx={{ width: '100%' }}>
                  {topFarmers.map((farmer, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <Divider component="li" />}
                      <ListItem sx={{ px: 1, py: 1.5, borderRadius: 1, '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.03)' } }}>
                        <ListItemAvatar>
                          <Avatar 
                            src={farmer.avatar || "/placeholder.svg"}
                            alt={farmer.name}
                            sx={{ width: 44, height: 44, border: '2px solid #e0e0e0' }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {farmer.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {farmer.location || "Location not available"}
                            </Typography>
                          }
                        />
                        <Box 
                          sx={{ 
                            bgcolor: '#e8f5e9', 
                            color: '#2e7d32',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}
                        >
                          {farmer.orders || "0"} orders
                        </Box>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary">No top farmers found</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default MerchantDashboard;
