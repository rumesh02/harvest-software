import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import HarvestCard from "../../components/HarvestCard";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,

  CircularProgress,
  Alert,
} from "@mui/material";

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
    return <Alert severity="warning">Please log in to view your products</Alert>;
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="containerCards">
      <div className="p-1">
        <h2 className="mb-4">My Listed Harvests</h2>
        
        {error && (
          <Alert severity="error" className="mb-3">
            {error}
          </Alert>
        )}

        {products.length === 0 ? (
          <Alert severity="info">
            You haven't listed any harvests yet.
          </Alert>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
            {products.map((product) => (
              <div key={product._id} className="col">
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <TextField
            label="Price"
            type="number"
            fullWidth
            margin="normal"
            value={editForm.price}
            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
          />
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            margin="normal"
            value={editForm.quantity}
            onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleEditSubmit} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ListedItems;
