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
  CheckCircle,
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
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
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

      <Grid container spacing={4}>
        {purchases.map((purchase) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={purchase._id}>
            <Card sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
              }
            }}>
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="220"
                  image={purchase.items[0]?.imageUrl || "https://via.placeholder.com/300x220?text=Farm+Product"}
                  alt={purchase.items[0]?.name || "Farm Product"}
                  sx={{ 
                    objectFit: 'cover',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12
                  }}
                />
                <Chip
                  icon={<CheckCircle />}
                  label="Completed"
                  color="success"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(76, 175, 80, 0.9)',
                    color: 'white'
                  }}
                />
              </Box>
              
              <CardContent sx={{ 
                flexGrow: 1, 
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: '3em',
                    lineHeight: '1.5em'
                  }}
                >
                  {purchase.items[0]?.name || "Farm Product"}
                </Typography>

                <Divider />

                {/* Purchase Details */}
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Purchased on
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {format(new Date(purchase.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Person sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Farmer:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {purchase.farmerName || "Unknown Farmer"}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Payment sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Amount:
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      Rs. {purchase.amount.toFixed(2)}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider />

                {/* Order Details */}
                <Box sx={{ 
                  backgroundColor: '#f8f9fa', 
                  p: 2, 
                  borderRadius: 2,
                  border: '1px solid #e9ecef'
                }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        Order ID:
                      </Typography>
                      <Typography variant="caption" fontWeight="medium">
                        {purchase.orderId}
                      </Typography>
                    </Stack>
                    
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        Quantity:
                      </Typography>
                      <Typography variant="caption" fontWeight="medium">
                        {purchase.items[0]?.quantity || 0} kg
                      </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        Payment Method:
                      </Typography>
                      <Typography variant="caption" fontWeight="medium">
                        {purchase.paymentMethod || "Online Payment"}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </CardContent>

              <Box sx={{ p: 3, pt: 0 }}>
                <Button 
                  fullWidth
                  variant="contained" 
                  color="success" 
                  onClick={() => handleRateClick(purchase)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
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
