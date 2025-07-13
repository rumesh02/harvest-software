import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
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
  Alert,
  Button,
  Chip
} from '@mui/material';
import { 
  TrendingUp as RevenueIcon, 
  ShoppingCart as OrdersIcon, 
  AccountBalance as YearlyIcon,
  Person as PersonIcon,
  MonetizationOn as MoneyIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [revenueData, setRevenueData] = useState({
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    monthlyData: [],
    totalOrders: 27,
    topBuyers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth0();

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/revenue/farmer/${user.sub}`
        );
        setRevenueData(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        setError(error.response?.data?.message || "Failed to load revenue data");
      } finally {
        setLoading(false);
      }
    };

    if (user?.sub) {
      fetchRevenueData();
    }
  }, [user]);

  // Format the monthly data to ensure it has proper names and values
  const formattedMonthlyData = (revenueData.monthlyData || []).map(item => ({
    name: item.name || item.month || '',
    revenue: typeof item.revenue === 'number' ? item.revenue : 0,
  }));

  const { monthlyRevenue, yearlyRevenue, totalOrders, topBuyers, monthlyData } = revenueData;

  // Check if we have any data to display
  const hasData = totalOrders > 0 || monthlyRevenue > 0 || yearlyRevenue > 0 || (monthlyData && monthlyData.length > 0);

  // Enhanced stat card data with navigation bar colors
  const statCards = [
    {
      title: "Monthly Revenue",
      value: `Rs. ${monthlyRevenue.toLocaleString()}`,
      icon: <RevenueIcon />,
      gradient: "linear-gradient(135deg, #10B981 0%, #155724 100%)",
      bgColor: "#d4edda",
      color: "#155724"
    },
    {
      title: "Yearly Revenue",
      value: `Rs. ${yearlyRevenue.toLocaleString()}`,
      icon: <YearlyIcon />,
      gradient: "linear-gradient(135deg, #155724 0%, #10B981 100%)",
      bgColor: "#d4edda",
      color: "#155724"
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <OrdersIcon />,
      gradient: "linear-gradient(135deg, #10B981 0%, #155724 100%)",
      bgColor: "#d4edda",
      color: "#155724"
    }
  ];

  // Custom tooltip component for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #E5E7EB',
            borderRadius: 2,
            padding: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#155724', mb: 1 }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 500 }}>
            Revenue: Rs. {payload[0].value?.toLocaleString() || 0}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        background: '#f9f9f9'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#10B981', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading Dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, background: '#f9f9f9', minHeight: '100vh' }}>
        <Alert 
          severity="error" 
          sx={{
            maxWidth: 600,
            mx: 'auto',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => {
                setError(null);
                setLoading(true);
                // Retry fetch
                if (user?.sub) {
                  axios.get(`http://localhost:5000/api/revenue/farmer/${user.sub}`)
                    .then(response => {
                      setRevenueData(response.data);
                      setError(null);
                    })
                    .catch(error => {
                      setError(error.response?.data?.message || "Failed to load revenue data");
                    })
                    .finally(() => setLoading(false));
                }
              }}
              sx={{ fontWeight: 600 }}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
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
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#155724',
              mb: 1
            }}
          >
            Farmer Dashboard
          </Typography>
          <Typography variant="h6" color="#000" sx={{ fontWeight: 400 }}>
            Track your harvest sales and revenue growth
          </Typography>
        </Box>

        {/* Enhanced Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  background: card.bgColor,
                  border: `2px solid transparent`,
                  borderRadius: 3,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: 'relative',
                  overflow: 'hidden',
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(21, 87, 36, 0.15)",
                    border: `2px solid ${card.color}20`
                  },
                  "&::before": {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: card.gradient,
                    zIndex: 1
                  }
                }}
              >
                <CardContent sx={{ p: 4, pt: 5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="subtitle1" 
                        color="#000" 
                        gutterBottom
                        sx={{ fontWeight: 500, mb: 2 }}
                      >
                        {card.title}
                      </Typography>
                      <Typography 
                        variant="h3" 
                        component="div" 
                        sx={{ 
                          fontWeight: 700,
                          color: card.color
                        }}
                      >
                        {card.value}
                      </Typography>
                    </Box>
                    <Avatar 
                      sx={{ 
                        background: card.gradient,
                        width: 60,
                        height: 60,
                        boxShadow: '0 8px 20px rgba(21, 87, 36, 0.15)',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1) rotate(5deg)'
                        }
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
              background: 'linear-gradient(135deg, #10B981 0%, #155724 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MoneyIcon sx={{ color: 'white', fontSize: 40 }} />
            </Box>
            <Typography variant="h5" color="#000" gutterBottom sx={{ fontWeight: 600 }}>
              No Revenue Data Available Yet
            </Typography>
            <Typography variant="body1" color="#000" sx={{ maxWidth: 400, mx: 'auto' }}>
              Start listing your harvests to see your revenue analytics and track your business growth
            </Typography>
          </Box>
        )}
        
        <Grid container spacing={4}>
          <Grid item xs={12} lg={7}>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#155724', mb: 1 }}>
                    Monthly Revenue Analytics
                  </Typography>
                  <Typography variant="body2" color="#000">
                    Track your harvest sales revenue over time
                  </Typography>
                </Box>
                <Avatar 
                  sx={{ 
                    background: 'linear-gradient(135deg, #10B981 0%, #155724 100%)',
                    width: 56,
                    height: 56,
                    boxShadow: '0 8px 20px rgba(21, 87, 36, 0.15)'
                  }}
                >
                  <RevenueIcon />
                </Avatar>
              </Box>
              
              <Box sx={{ height: 350, mt: 3 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formattedMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#000', fontSize: 13, fontWeight: 500 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#000', fontSize: 13, fontWeight: 500 }}
                      tickFormatter={(value) => `Rs. ${value.toLocaleString()}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="revenue" 
                      fill="url(#colorGradient)"
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#155724" />
                      </linearGradient>
                    </defs>
                </BarChart>
              </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={5}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    background: 'linear-gradient(135deg, #10B981 0%, #155724 100%)',
                    width: 48,
                    height: 48,
                    mr: 2,
                    boxShadow: '0 4px 12px rgba(21, 87, 36, 0.15)'
                  }}
                >
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#155724' }}>
                    Top Buyers
                  </Typography>
                  <Typography variant="body2" color="#000">
                    Your most valuable customers
                  </Typography>
                </Box>
              </Box>
              
              {topBuyers && topBuyers.length > 0 ? (
                <List sx={{ width: '100%' }}>
                  {topBuyers.map((buyer, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <Divider component="li" sx={{ my: 1 }} />}
                      <ListItem 
                        sx={{ 
                          px: 2, 
                          py: 2, 
                          borderRadius: 2, 
                          transition: 'all 0.3s ease',
                          '&:hover': { 
                            bgcolor: '#d4edda',
                            transform: 'translateX(4px)'
                          } 
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            src={buyer.avatar || "/placeholder.svg"}
                            alt={buyer.name}
                            sx={{ 
                              width: 50, 
                              height: 50, 
                              border: '3px solid #E5E7EB',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#155724' }}>
                              {buyer.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="#000" sx={{ mt: 0.5 }}>
                              {buyer.location || "Location not available"}
                            </Typography>
                          }
                        />
                        <Chip
                          label={`Rs. ${buyer.totalSpent?.toLocaleString() || "0"}`}
                          sx={{
                            background: 'linear-gradient(135deg, #10B981 0%, #155724 100%)',
                            color: 'white',
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(21, 87, 36, 0.15)'
                          }}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  background: '#d4edda',
                  borderRadius: 2
                }}>
                  <PersonIcon sx={{ fontSize: 48, color: '#000', mb: 2 }} />
                  <Typography color="#000" sx={{ fontWeight: 500 }}>
                    No top buyers found yet
                  </Typography>
                  <Typography variant="body2" color="#000" sx={{ mt: 1 }}>
                    Start selling your harvests to build customer relationships
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
