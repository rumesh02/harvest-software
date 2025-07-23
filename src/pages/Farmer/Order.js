import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
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
  Snackbar,
  Alert,
  Container,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from "@mui/material";
import Pagination from '@mui/material/Pagination';
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

const statusStyles = {
  Done: { bgcolor: '#43a047', color: '#fff' }, // Green
  Pending: { bgcolor: '#e0e0e0', color: '#2e7d32' }, // Gray bg, green text
  Reject: { bgcolor: '#f5f5f5', color: '#b71c1c' }, // Light gray bg, dark red text
};

const paymentStyles = {
  Completed: { bgcolor: '#43a047', color: '#fff' }, // Green
  Pending: { bgcolor: '#e0e0e0', color: '#2e7d32' }, // Gray bg, green text
  Cancelled: { bgcolor: '#f5f5f5', color: '#b71c1c' }, // Light gray bg, dark red text
  Disabled: { bgcolor: '#f5f5f5', color: '#9e9e9e' }, // Gray for disabled
};

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        setError(null);
        const farmerId = localStorage.getItem("user_id");
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

        // Also fetch collections data to check for payment status
        let collectionsMap = {};
        try {
          // Now using the new farmer collections endpoint
          const collectionsResponse = await axios.get(`http://localhost:5000/api/collections/farmer/${farmerId}`);
          const collections = collectionsResponse.data || [];
          collections.forEach(collection => {
            if (collection.bidId) {
              collectionsMap[collection.bidId.toString()] = collection.status;
            }
          });
        } catch (collectionsError) {
          console.error("Error fetching collections:", collectionsError);
        }

        const transformedOrders = await Promise.all(
          bids.map(async (bid) => {
            let merchantName = "Anonymous";
            let merchantPhone = "N/A";
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

            // Check payment status from both confirmed bids and collections
            const confirmedBidKey = `${bid.farmerId}_${bid.merchantId}`;
            const confirmedBid = confirmedBidsMap[confirmedBidKey];
            
            // Look up collection by bidId (more direct)
            const collectionStatus = collectionsMap[bid._id];
            
            // Ensure paymentStatus is always set
            let paymentStatus = getPaymentStatus(bid.status, collectionStatus, confirmedBid);
            if (!paymentStatus) paymentStatus = 'Pending';

            return {
              id: bid._id,
              harvest: bid.productName,
              price: `Rs. ${bid.bidAmount}`,
              weight: `${bid.orderWeight}kg`,
              buyer: merchantName,
              phone: merchantPhone,
              status: getOrderStatus(bid.status),
              paymentStatus,
              bidStatus: bid.status, // Keep original bid status for reference
            };
          })
        );
        setOrders(transformedOrders);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders. Please try again.");
        setSnackbar({ open: true, message: 'Error fetching orders', severity: 'error' });
        setLoading(false);
      }
    };
    fetchBids();
    const interval = setInterval(fetchBids, 90000);
    return () => clearInterval(interval);
  }, []);

  const getOrderStatus = (bidStatus) => {
    switch (bidStatus) {
      case "Accepted":
        return "Pending";
      case "Rejected":
        return "Reject";
      case "Completed":
        return "Done";
      default:
        return bidStatus;
    }
  };

  // Determine payment status based on merchant payment completion
  const getPaymentStatus = (bidStatus, collectionStatus, confirmedBid) => {
    // If order is rejected by farmer, payment status is disabled
    if (bidStatus === "Rejected") {
      return "Cancelled";
    }
    
    // Check if merchant has paid via collection status (most up-to-date)
    if (collectionStatus === "paid") {
      return "Completed";
    }
    
    // Fallback to confirmed bid status
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

  const handleStatusChange = async (id, newStatus) => {
    try {
      let bidStatus;
      switch (newStatus) {
        case "Done":
          bidStatus = "Completed";
          break;
        case "Reject":
          bidStatus = "Rejected";
          break;
        case "Pending":
          bidStatus = "Accepted";
          break;
        default:
          bidStatus = newStatus;
      }
      await axios.put(`http://localhost:5000/api/bids/status/${id}`, { status: bidStatus });
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

  // Pagination logic
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Box sx={{ bgcolor: '#f5fff5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2e7d32', mb: 3 }}>
          <OrderIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Orders
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
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
                      {orders.filter(o => o.status === 'Reject' || o.bidStatus === 'Rejected').length}
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
          <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4, bgcolor: '#fff' }}>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, boxShadow: 1, bgcolor: '#fafafa' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>No.</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Harvest</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Bid Price</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Weight</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Buyer</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Mobile No.</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Order Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Payment Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentItems.map((order, index) => {
                    const isRejected = order.bidStatus === 'Rejected' || order.status === 'Reject';
                    const isDone = order.status === 'Done';
                    const isDisabled = isRejected || isDone;
                    
                    return (
                      <TableRow 
                        key={order.id} 
                        hover={!isDisabled}
                        sx={{ 
                          bgcolor: (indexOfFirstItem + index) % 2 === 0 ? '#fff' : '#f5f5f5',
                          opacity: isDisabled ? 0.8 : 1,
                        }}
                      >
                        <TableCell>{indexOfFirstItem + index + 1}</TableCell>
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
                              sx={{
                                ...statusStyles.Reject,
                                fontWeight: 600,
                                px: 1.5,
                                fontSize: 15,
                              }}
                            />
                          ) : (
                            <FormControl size="small" fullWidth>
                              <Select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                disabled={isDone}
                                sx={{
                                  ...statusStyles[order.status],
                                  fontWeight: 600,
                                  borderRadius: 1,
                                  '& .MuiSelect-select': {
                                    py: 1.2,
                                  },
                                }}
                              >
                                <MenuItem value="Done" sx={statusStyles.Done}>Done</MenuItem>
                                <MenuItem value="Pending" sx={statusStyles.Pending}>Pending</MenuItem>
                                <MenuItem value="Reject" sx={statusStyles.Reject}>Reject</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={isRejected ? "Cancelled" : order.paymentStatus}
                            sx={{
                              ...paymentStyles[isRejected ? "Cancelled" : order.paymentStatus],
                              fontWeight: 600,
                              px: 1.5,
                              fontSize: 15,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, value) => setCurrentPage(value)}
                  color="primary"
                  shape="rounded"
                />
              </Box>
            )}
          </Paper>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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
    </Box>
  );
};

export default OrderPage;