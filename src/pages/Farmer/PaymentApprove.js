import React, { useState } from "react";
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
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Card,
  CardContent,
  Grid
} from "@mui/material";
import {
  Payment as PaymentIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon
} from "@mui/icons-material";

const PaymentApprove = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionType, setActionType] = useState('');

  const [payments, setPayments] = useState([
    {
      id: 1,
      harvest: "Carrot",
      billTotal: 27000,
      method: "Online",
      buyer: "Nimal Perera",
      date: "2025/01/06",
      status: "Pending"
    },
    {
      id: 2,
      harvest: "Onion",
      billTotal: 126500,
      method: "Transfer",
      buyer: "Kamal Silva",
      date: "2025/01/21",
      status: "Pending"
    },
    {
      id: 3,
      harvest: "Potato",
      billTotal: 45000,
      method: "Online",
      buyer: "Sunil Fernando",
      date: "2025/01/15",
      status: "Approved"
    }
  ]);

  const handleAction = (payment, action) => {
    setSelectedPayment(payment);
    setActionType(action);
    setOpenDialog(true);
  };

  const confirmAction = () => {
    if (selectedPayment && actionType) {
      const newStatus = actionType === 'approve' ? 'Approved' : 'Cancelled';
      setPayments(payments.map(payment => 
        payment.id === selectedPayment.id 
          ? { ...payment, status: newStatus }
          : payment
      ));
      setOpenDialog(false);
      setSelectedPayment(null);
      setActionType('');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Cancelled':
        return 'error';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getMethodIcon = (method) => {
    return method === 'Online' ? <CardIcon /> : <BankIcon />;
  };

  const totalPendingAmount = payments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + p.billTotal, 0);

  const approvedAmount = payments
    .filter(p => p.status === 'Approved')
    .reduce((sum, p) => sum + p.billTotal, 0);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
        <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Payment Approve
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Pending Payments
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                    Rs. {totalPendingAmount.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56 }}>
                  <MoneyIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#e8f5e8', borderLeft: '4px solid #4caf50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Approved Payments
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    Rs. {approvedAmount.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                  <CheckIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#f3e5f5', borderLeft: '4px solid #9c27b0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Payments
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                    {payments.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#9c27b0', width: 56, height: 56 }}>
                  <PaymentIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payments Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>No.</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Harvest</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Bill Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Method</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Buyer</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment, index) => (
                <TableRow key={payment.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: '#2e7d32', mr: 2, width: 32, height: 32 }}>
                        {payment.harvest.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {payment.harvest}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                      Rs. {payment.billTotal.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getMethodIcon(payment.method)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {payment.method}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ color: '#666', mr: 1 }} />
                      <Typography variant="body2">
                        {payment.buyer}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {payment.date}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status}
                      color={getStatusColor(payment.status)}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {payment.status === 'Pending' && (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckIcon />}
                            onClick={() => handleAction(payment, 'approve')}
                            sx={{ minWidth: 100 }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<CloseIcon />}
                            onClick={() => handleAction(payment, 'cancel')}
                            sx={{ minWidth: 100 }}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {payment.status !== 'Pending' && (
                        <Typography variant="body2" color="text.secondary">
                          {payment.status}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Confirm {actionType === 'approve' ? 'Approval' : 'Cancellation'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Alert severity={actionType === 'approve' ? 'success' : 'warning'} sx={{ mb: 2 }}>
              Are you sure you want to {actionType === 'approve' ? 'approve' : 'cancel'} the payment for{' '}
              <strong>{selectedPayment.harvest}</strong> from <strong>{selectedPayment.buyer}</strong>?
            </Alert>
          )}
          {selectedPayment && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Amount:</strong> Rs. {selectedPayment.billTotal.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Method:</strong> {selectedPayment.method}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Date:</strong> {selectedPayment.date}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={confirmAction}
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
            autoFocus
          >
            {actionType === 'approve' ? 'Approve' : 'Cancel'} Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PaymentApprove;
