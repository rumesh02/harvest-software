import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import HarvestCard from "../../components/HarvestCard";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  InputAdornment
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Edit as EditIcon,
  AttachMoney as MoneyIcon,
  Scale as ScaleIcon,
  DriveFileRenameOutline as NameIcon,
  Add as AddIcon
} from "@mui/icons-material";

const ListedItems = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    quantity: "",
  });
  const { user, isAuthenticated } = useAuth0();

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Use the dedicated endpoint for farmer's products
      const response = await axios.get(`http://localhost:5000/api/products/farmer/${user.sub}`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [user?.sub]);

  useEffect(() => {
    if (isAuthenticated && user?.sub) {
      fetchProducts();
    }
  }, [user, isAuthenticated, fetchProducts]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      if (!editingProduct?._id) return;

      const response = await axios.put(
        `http://localhost:5000/api/products/${editingProduct._id}`,
        {
          ...editForm,
          farmerID: user.sub
        }
      );

      if (response.status === 200) {
        setEditDialogOpen(false);
        fetchProducts(); // Refresh the list
        setError(null);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      setError(error.response?.data?.message || "Failed to update product");
    }
  };

  const handleRemove = async (productId) => {
    if (window.confirm("Are you sure you want to remove this product?")) {
      try {
        const response = await axios.delete(
          `http://localhost:5000/api/products/${productId}`
        );

        if (response.status === 200) {
          fetchProducts(); // Refresh the list
          setError(null);
        }
      } catch (error) {
        console.error("Error removing product:", error);
        setError(error.response?.data?.message || "Failed to remove product");
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">Please log in to view your products</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 600, 
              color: '#2E7D32',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <InventoryIcon fontSize="large" />
            My Listed Harvests
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your listed products
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {products.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 8, bgcolor: '#f8f9fa' }}>
            <CardContent>
              <InventoryIcon sx={{ fontSize: 80, color: '#6c757d', mb: 2 }} />
              <Typography variant="h5" gutterBottom color="text.secondary">
                No Listed Harvests
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                You haven't listed any harvests yet. Start by adding your first harvest!
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: '#4CAF50',
                  '&:hover': {
                    backgroundColor: '#45a049'
                  }
                }}
                onClick={() => window.location.href = '/list-new-item'}
              >
                List New Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Products Summary */}
            <Alert severity="info" sx={{ mb: 3 }}>
              You have <strong>{products.length}</strong> listed harvest{products.length !== 1 ? 's' : ''}
            </Alert>

            {/* Products Grid */}
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                  <HarvestCard
                    image={product.image}
                    name={product.name}
                    price={product.price}
                    weight={product.quantity}
                    type={product.type}
                    listedDate={new Date(product.listedDate).toLocaleDateString()}
                    onEdit={() => handleEdit(product)}
                    onRemove={() => handleRemove(product._id)}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Paper>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600, 
          color: '#2E7D32',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <EditIcon />
          Edit Product
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Product Name"
            fullWidth
            margin="normal"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <NameIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Price per Kg"
            type="number"
            fullWidth
            margin="normal"
            value={editForm.price}
            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MoneyIcon />
                  Rs.
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Available Quantity"
            type="number"
            fullWidth
            margin="normal"
            value={editForm.quantity}
            onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ScaleIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  Kg
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setEditDialogOpen(false)} 
            variant="outlined"
            sx={{
              borderColor: '#757575',
              color: '#757575',
              '&:hover': {
                borderColor: '#424242',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            sx={{
              backgroundColor: '#4CAF50',
              '&:hover': {
                backgroundColor: '#45a049'
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ListedItems;
