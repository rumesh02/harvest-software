import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Stack,
  Pagination
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const ITEMS_PER_PAGE = 10;

const AcceptRejectBids = () => {
  const [pendingBids, setPendingBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  useEffect(() => {
    fetchPendingBids();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast({ ...toast, visible: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
  };

  const fetchPendingBids = async () => {
    setLoading(true);
    try {
      const farmerId = localStorage.getItem("user_id");
      const response = await axios.get(`http://localhost:5000/api/bids?farmerId=${farmerId}`);
      let pending = response.data.filter(bid => bid.status === "Pending");
      pending = pending.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return b._id.localeCompare(a._id);
      });
      setPendingBids(pending);
    } catch (error) {
      showToast("Failed to load bids. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBidAction = async (bidId, action) => {
    setActionInProgress(bidId + action);
    try {
      if (!bidId) {
        throw new Error("Bid ID is missing");
      }
      
      console.log(`Farmer is ${action.toLowerCase()}ing bid:`, bidId);
      const farmerId = localStorage.getItem('user_id');
      console.log('Current farmer ID:', farmerId);
      
      const endpoint = `http://localhost:5000/api/bids/${action.toLowerCase()}/${bidId}`;
      const response = await axios.put(endpoint);
      
      if (response.data) {
        console.log(`Bid ${action.toLowerCase()}ed successfully!`, response.data);
        showToast(`Bid ${action.toLowerCase()}ed successfully!`);
        
        // Refresh the bids list
        await fetchPendingBids();
      }
    } catch (error) {
      let errorMessage = `Failed to ${action.toLowerCase()} bid. `;
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      showToast(errorMessage, "error");
      console.error(`Error ${action.toLowerCase()}ing bid:`, error);
    } finally {
      setActionInProgress(null);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(pendingBids.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = pendingBids.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (event, value) => setCurrentPage(value);

  // Debug function to check notifications
  const checkNotifications = async () => {
    try {
      const farmerId = localStorage.getItem('user_id');
      console.log('🔍 Checking notifications for farmer:', farmerId);
      
      const response = await axios.get(`http://localhost:5000/api/notifications/${farmerId}`);
      console.log('📋 All notifications:', response.data);
      
      const unreadResponse = await axios.get(`http://localhost:5000/api/notifications/unread/${farmerId}`);
      console.log('🔔 Unread count:', unreadResponse.data.unreadCount);
      
      // Show the latest 3 notifications
      const latest = response.data.slice(0, 3);
      console.log('📄 Latest 3 notifications:', latest);
      
      if (response.data.length === 0) {
        showToast('No notifications found. Try placing a bid from merchant account first.', 'info');
      } else {
        showToast(`Found ${response.data.length} notifications (${unreadResponse.data.unreadCount} unread). Check console for details.`, 'success');
      }
    } catch (error) {
      console.error('❌ Error checking notifications:', error);
      showToast('Failed to check notifications', 'error');
    }
  };

  return (
    <Box sx={{ bgcolor: 'green.50', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={2}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="green.800" gutterBottom>
                Manage Harvest Bids
              </Typography>
              <Typography variant="subtitle1" color="green.700">
                Review and respond to pending bids from buyers
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                color="info"
                onClick={checkNotifications}
                sx={{ minWidth: 140 }}
              >
                Check Notifications
              </Button>
              <Button
                variant="outlined"
                color="success"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                onClick={fetchPendingBids}
                disabled={loading}
                sx={{ minWidth: 150 }}
              >
                {loading ? "Refreshing..." : "Refresh Bids"}
              </Button>
            </Box>
          </Stack>

          {loading && pendingBids.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={8}>
              <CircularProgress color="success" sx={{ mb: 2 }} />
              <Typography color="green.800" fontWeight={500}>Loading your pending bids...</Typography>
            </Box>
          ) : pendingBids.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={8}>
              <CheckIcon sx={{ fontSize: 60, color: 'green.200', mb: 2 }} />
              <Typography variant="h6" color="green.800" fontWeight={600} mb={1}>No Pending Bids</Typography>
              <Typography color="green.600" align="center" maxWidth={400}>
                You don't have any pending bids at the moment. When buyers place bids on your harvests, they'll appear here.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, boxShadow: 1 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'green.100' }}>
                    <TableCell>No.</TableCell>
                    <TableCell>Harvest</TableCell>
                    <TableCell>Bid Price</TableCell>
                    <TableCell>Weight</TableCell>
                    <TableCell>Buyer</TableCell>
                    <TableCell>Mobile No.</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentItems.map((bid, index) => (
                    <TableRow key={bid._id} hover>
                      <TableCell>{indexOfFirstItem + index + 1}</TableCell>
                      <TableCell>{bid.productName}</TableCell>
                      <TableCell sx={{ color: 'green.700', fontWeight: 600 }}>Rs. {bid.bidAmount?.toLocaleString() || bid.bidAmount}</TableCell>
                      <TableCell>{bid.orderWeight?.toLocaleString() || bid.orderWeight} kg</TableCell>
                      <TableCell>{bid.merchantName || "Anonymous"}</TableCell>
                      <TableCell>{bid.merchantPhone || "N/A"}</TableCell>
                      <TableCell align="center">
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center">
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckIcon />}
                            disabled={actionInProgress !== null}
                            onClick={() => handleBidAction(bid._id, "Accept")}
                            sx={{ minWidth: 100 }}
                          >
                            {actionInProgress === bid._id + "Accept" ? <CircularProgress size={18} color="inherit" /> : "Accept"}
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<CloseIcon />}
                            disabled={actionInProgress !== null}
                            onClick={() => handleBidAction(bid._id, "Reject")}
                            sx={{ minWidth: 100 }}
                          >
                            {actionInProgress === bid._id + "Reject" ? <CircularProgress size={18} color="inherit" /> : "Reject"}
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Pagination */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={2}>
                  <Typography variant="body2" color="text.secondary">
                    Showing <b>{indexOfFirstItem + 1}</b> to <b>{Math.min(indexOfLastItem, pendingBids.length)}</b> of <b>{pendingBids.length}</b> bids
                  </Typography>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="success"
                    shape="rounded"
                  />
                </Box>
              )}
            </TableContainer>
          )}
        </Paper>
        <Snackbar
          open={toast.visible}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          autoHideDuration={3000}
          onClose={() => setToast({ ...toast, visible: false })}
        >
          <Alert
            onClose={() => setToast({ ...toast, visible: false })}
            severity={toast.type === "success" ? "success" : "error"}
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AcceptRejectBids;
