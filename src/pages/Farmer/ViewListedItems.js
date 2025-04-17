import React, { useState, useEffect } from "react";
import axios from "axios";
import HarvestCard from "../../components/HarvestCard";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

const ListedItems = () => {
  const [products, setProducts] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    quantity: "",
  });

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to load products");
    }
  };

  // Handle edit button click
  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
    });
    setEditDialogOpen(true);
  };

  // Handle edit form submission
  const handleEditSubmit = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/products/${editingProduct._id}`,
        editForm
      );
      setEditDialogOpen(false);
      fetchProducts(); // Refresh the products list
      alert("Product updated successfully");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    }
  };

  // Handle remove button click
  const handleRemove = async (productId) => {
    if (window.confirm("Are you sure you want to remove this product?")) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${productId}`);
        fetchProducts(); // Refresh the products list
        alert("Product removed successfully");
      } catch (error) {
        console.error("Error removing product:", error);
        alert("Failed to remove product");
      }
    }
  };

  return (
    <div className="containerCards">
      <div className="p-1">
        <h2 className="mb-4">Listed Items</h2>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {products.map((product) => (
            <div key={product._id} className="col">
              <HarvestCard
                image={product.image}
                name={product.name}
                price={product.price}
                weight={product.quantity}
                onEdit={() => handleEdit(product)}
                onRemove={() => handleRemove(product._id)}
              />
            </div>
          ))}
        </div>
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
