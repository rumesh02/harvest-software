import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { 
  Visibility, 
  Reply, 
  CheckCircle, 
  Schedule, 
  Email,
  Person 
} from '@mui/icons-material';

const ContactMessagesAdmin = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const url = statusFilter 
        ? `http://localhost:5000/api/contact/admin/all?status=${statusFilter}`
        : 'http://localhost:5000/api/contact/admin/all';
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setMessages(result.data.messages);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/contact/admin/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [fetchMessages, fetchStats]);

  const handleStatusUpdate = async (messageId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/contact/admin/${messageId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();
      
      if (result.success) {
        fetchMessages();
        fetchStats();
        setDialogOpen(false);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to update status');
      console.error('Error updating status:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'error';
      case 'read': return 'warning';
      case 'replied': return 'info';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Contact Messages Admin Panel
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Email color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.totalMessages || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Messages
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Schedule color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.statusBreakdown?.new || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    New Messages
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Reply color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.statusBreakdown?.replied || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Replied
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircle color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.statusBreakdown?.resolved || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Resolved
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="read">Read</MenuItem>
            <MenuItem value="replied">Replied</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Messages Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Message Preview</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message._id}>
                <TableCell>{message.name}</TableCell>
                <TableCell>{message.email}</TableCell>
                <TableCell>
                  {message.message.substring(0, 50)}
                  {message.message.length > 50 && '...'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={message.status.toUpperCase()}
                    color={getStatusColor(message.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(message.createdAt)}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => {
                      setSelectedMessage(message);
                      setDialogOpen(true);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Message Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedMessage && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <Person sx={{ mr: 1 }} />
                Message from {selectedMessage.name}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Email: {selectedMessage.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {formatDate(selectedMessage.createdAt)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: <Chip
                    label={selectedMessage.status.toUpperCase()}
                    color={getStatusColor(selectedMessage.status)}
                    size="small"
                  />
                </Typography>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Message:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body1">
                  {selectedMessage.message}
                </Typography>
              </Paper>

              <Box sx={{ mt: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Update Status</InputLabel>
                  <Select
                    value={selectedMessage.status}
                    label="Update Status"
                    onChange={(e) => handleStatusUpdate(selectedMessage._id, e.target.value)}
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="read">Read</MenuItem>
                    <MenuItem value="replied">Replied</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default ContactMessagesAdmin;
