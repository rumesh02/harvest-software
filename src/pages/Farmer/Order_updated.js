import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Chip,
  Avatar,
  FormControl,
  Alert,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Snackbar
} from "@mui/material";
import {
  ShoppingCart as OrderIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Scale as WeightIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon
} from "@mui/icons-material";

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch bids and convert them to orders
  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        setError(null);
        const farmerId = localStorage.getItem("user_id"); // Get logged-in farmer's ID
        const response = await axios.get(`http://localhost:5000/api/bids?farmerId=${farmerId}`);
        const bids = response.data;

        // Fetch all confirmed bids to check payment status
        let confirmedBidsMap = {};
        try {
          const confirmedBidsResponse = await axios.get(`http://localhost:5000/api/confirmedbids`);
          const confirmedBids = confirmedBidsResponse.data || [];
          // Create a map by farmerId + merchantId for quick lookup
          confirmedBids.forEach(cb => {
            const key = `${cb.farmerId}_${cb.merchantId}`;
            confirmedBidsMap[key] = cb;
          });
        } catch (confirmedBidError) {
          console.error("Error fetching confirmed bids:", confirmedBidError);
        }

        // Fetch merchant details for each bid
        const transformedOrders = await Promise.all(
          bids.map(async (bid) => {
            let merchantName = "Anonymous";
            let merchantPhone = "N/A";

            // Fetch merchant details from the backend
            if (bid.merchantId) {
              try {
                const merchantResponse = await axios.get(`http://localhost:5000/api/users/${bid.merchantId}`);
                const merchant = merchantResponse.data;
                merchantName = merchant.name || "Anonymous";
                merchantPhone = merchant.phone || "N/A";
              } catch (error) {
                console.error(`Error fetching merchant details for ID ${bid.merchantId}:`, error);
              }
            }

            // Check payment status from confirmed bids
            const confirmedBidKey = `${bid.farmerId}_${bid.merchantId}`;
            const confirmedBid = confirmedBidsMap[confirmedBidKey];
            
            // Transform bid to order format
            return {
              id: bid._id,
              harvest: bid.productName,
              price: `Rs. ${bid.bidAmount}`,
              weight: `${bid.orderWeight}kg`,
              buyer: merchantName,
              phone: merchantPhone,
              status: getOrderStatus(bid.status),
              paymentStatus: getPaymentStatus(bid.status, confirmedBid),
              bidStatus: bid.status, // Keep original bid status for reference
            };
          })
        );

        setOrders(transformedOrders);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders. Please try again.");
        setLoading(false);
      }
    };

    fetchBids();
    // Refresh orders every 30 seconds
    const interval = setInterval(fetchBids, 30000);
    return () => clearInterval(interval);
  }, []);

  // Convert bid status to order status (only Pending and Done)
  const getOrderStatus = (bidStatus) => {
    switch (bidStatus) {
      case "Accepted":
        return "Pending";
      case "Completed":
        return "Done";
      default:
        return bidStatus;
    }
  };

  // Determine payment status based on merchant payment completion
  const getPaymentStatus = (bidStatus, confirmedBid) => {
    // If order is rejected by farmer, payment status is disabled/cancelled
    if (bidStatus === "Rejected") {
      return "Cancelled";
    }
    
    // If merchant has paid (confirmed bid status is "paid"), show Completed
    if (confirmedBid && confirmedBid.status === "paid") {
      return "Completed";
    }
    
    // If farmer has completed the order, show Completed
    if (bidStatus === "Completed") {
      return "Completed";
    }
    
    // Default to Pending for accepted bids
    if (bidStatus === "Accepted") {
      return "Pending";
    }
    
    return "Pending";
  };

  // Handle order status changes
  const handleStatusChange = async (id, newStatus) => {
    try {
      // Convert order status back to bid status
      let bidStatus;
      switch (newStatus) {
        case "Done":
          bidStatus = "Completed";
          break;
        case "Pending":
          bidStatus = "Accepted";
          break;
        default:
          bidStatus = newStatus;
      }

      // Update bid status in backend
      await axios.put(`http://localhost:5000/api/bids/status/${id}`, {
        status: bidStatus,
      });

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === id ? { ...order, status: newStatus } : order
        )
      );
      
      setSnackbar({ open: true, message: 'Order status updated successfully', severity: 'success' });
    } catch (error) {
      console.error("Error updating order status:", error);
      setSnackbar({ open: true, message: 'Failed to update order status', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
        <OrderIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Orders
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Pending Orders
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                    {orders.filter(o => o.status === 'Pending').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56 }}>
                  <ScheduleIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#e8f5e8', borderLeft: '4px solid #4caf50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Completed Orders
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    {orders.filter(o => o.status === 'Done').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                  <CheckIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#ffebee', borderLeft: '4px solid #f44336' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Rejected Orders
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                    {orders.filter(o => o.bidStatus === 'Rejected').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#f44336', width: 56, height: 56 }}>
                  <CancelIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#f3e5f5', borderLeft: '4px solid #9c27b0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Orders
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                    {orders.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#9c27b0', width: 56, height: 56 }}>
                  <OrderIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        /* Orders Table */
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>No.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Harvest</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Bid Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Weight</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Buyer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Mobile No.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Order Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Payment Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order, index) => {
                  const isRejected = order.bidStatus === 'Rejected';
                  const isDone = order.status === 'Done';
                  const isDisabled = isRejected || isDone;
                  
                  return (
                    <TableRow 
                      key={order.id} 
                      hover={!isDisabled}
                      sx={{ 
                        opacity: isDisabled ? 0.6 : 1,
                        backgroundColor: isDone ? '#f8f9fa' : 'inherit'
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: '#2e7d32', mr: 2, width: 32, height: 32 }}>
                            <InventoryIcon />
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {order.harvest}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MoneyIcon sx={{ color: '#2e7d32', mr: 1 }} />
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                            {order.price}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <WeightIcon sx={{ color: '#666', mr: 1 }} />
                          <Typography variant="body2">
                            {order.weight}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ color: '#666', mr: 1 }} />
                          <Typography variant="body2">
                            {order.buyer}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon sx={{ color: '#666', mr: 1 }} />
                          <Typography variant="body2">
                            {order.phone}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {isRejected ? (
                          <Chip
                            label="Rejected"
                            color="error"
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        ) : (
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              disabled={isDone} // Disable when status is Done
                              sx={{
                                bgcolor: order.status === "Done" ? "#e8f5e8" : 
                                       order.status === "Pending" ? "#fff3e0" : "#f5f5f5",
                                '& .MuiSelect-select': {
                                  fontWeight: 'medium'
                                }
                              }}
                            >
                              <MenuItem value="Pending">Pending</MenuItem>
                              <MenuItem value="Done">Done</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.paymentStatus}
                          color={
                            order.paymentStatus === "Cancelled" ? "error" :
                            order.paymentStatus === "Completed" ? "success" :
                            "warning"
                          }
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrderPage;
