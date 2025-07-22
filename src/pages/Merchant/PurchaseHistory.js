import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Chip,
  Divider,
  Avatar,
  Stack,
  Paper,
} from "@mui/material";
import {
  ShoppingBag,
  Person,
  CalendarToday,
  Payment,
  Star,
  CheckCircle,
  Phone,
} from "@mui/icons-material";
import { useAuth0 } from "@auth0/auth0-react";
import { fetchCompletedPayments } from "../../services/orderService";
import { format } from 'date-fns';
import ReviewDialog from "../../components/ReviewDialog"; // Make sure this path is correct

const PurchaseHistory = () => {
  const { user } = useAuth0();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const loadCompletedPayments = async () => {
      if (!user?.sub) return;

      try {
        setLoading(true);
        const completedPayments = await fetchCompletedPayments(user.sub);
        setPurchases(completedPayments);
      } catch (error) {
        console.error("Error loading completed payments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCompletedPayments();
  }, [user]);

  const handleRateClick = (order) => {
    setSelectedOrder(order);
    setSelectedFarmer(order.farmerName || "Unknown Farmer");
    setReviewOpen(true);
  };

  const handleReviewClose = (success) => {
    if (success) {
      alert(`Review submitted successfully for ${selectedFarmer}!`);
    }
    setReviewOpen(false);
    setSelectedOrder(null);
    setSelectedFarmer("");
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        mt: 8,
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading your purchase history...
        </Typography>
      </Box>
    );
  }

  if (purchases.length === 0) {
    return (
      <Box sx={{ padding: "32px" }}>
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <ShoppingBag sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Purchase History
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            No purchases yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            When you complete your first purchase, it will appear here.
            Start browsing our fresh farm products!
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: "32px", backgroundColor: '#fafafa', minHeight: '100vh' }}>
      {/* Header Section */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'rgba(255, 165, 0, 0.1)', border: '1px solid rgba(255, 165, 0, 0.2)' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Avatar sx={{ bgcolor: '#FF8C00', width: 56, height: 56 }}>
            <ShoppingBag />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Purchase History
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Track all your completed orders and transactions
            </Typography>
          </Box>
        </Stack>
        
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 3 }}>
          <Chip 
            icon={<CheckCircle />} 
            label={`${purchases.length} Completed Orders`}
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
          <Typography variant="body2" color="text.secondary">
            Total spent: Rs. {purchases.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
          </Typography>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {purchases.map((purchase) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={purchase._id}>
            <Card sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
              }
            }}>
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={purchase.items[0]?.imageUrl || "https://via.placeholder.com/300x160?text=Farm+Product"}
                  alt={purchase.items[0]?.name || "Farm Product"}
                  sx={{ 
                    objectFit: 'cover',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8
                  }}
                />
                <Chip
                  icon={<CheckCircle />}
                  label="Completed"
                  color="success"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(76, 175, 80, 0.9)',
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
              
              <CardContent sx={{ 
                flexGrow: 1, 
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5
              }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="bold"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: '2.5em',
                    lineHeight: '1.25em',
                    fontSize: '0.95rem'
                  }}
                >
                  {purchase.items[0]?.name || "Farm Product"}
                </Typography>

                <Divider />

                {/* Purchase Details */}
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(purchase.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" fontWeight="medium" sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '150px'
                    }}>
                      {purchase.farmerName || "Unknown Farmer"}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 3 }}>
                    <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" fontWeight="medium" sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '150px',
                      color: 'text.secondary'
                    }}>
                      {purchase.farmerPhone || "Contact not available"}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Payment sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                      Rs. {purchase.amount.toFixed(2)}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider />

                {/* Order Details */}
                <Box sx={{ 
                  backgroundColor: '#f8f9fa', 
                  p: 1.5, 
                  borderRadius: 1,
                  border: '1px solid #e9ecef'
                }}>
                  <Stack spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Order ID:
                      </Typography>
                      <Typography variant="caption" fontWeight="medium" sx={{ fontSize: '0.7rem' }}>
                        {purchase.orderId.slice(-8)}...
                      </Typography>
                    </Stack>
                    
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Quantity:
                      </Typography>
                      <Typography variant="caption" fontWeight="medium" sx={{ fontSize: '0.7rem' }}>
                        {purchase.items[0]?.quantity || 0} kg
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  fullWidth
                  variant="contained" 
                  color="success" 
                  onClick={() => handleRateClick(purchase)}
                  startIcon={<Star />}
                  sx={{
                    borderRadius: 1.5,
                    py: 1,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Rate Farmer
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Review Dialog */}
      <ReviewDialog
        open={reviewOpen}
        onClose={handleReviewClose}
        farmerId={selectedOrder?.farmerId}
        merchantId={user?.sub}
        orderId={selectedOrder?._id}
        farmerRatings={{}}
        product={selectedOrder?.items?.[0]}
      />
    </Box>
  );
};

export default PurchaseHistory;
