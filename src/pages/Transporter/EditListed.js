import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Avatar,
  Divider
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalShipping as VehicleIcon,
  Add as AddIcon
} from "@mui/icons-material";
import { getVehicles, updateVehicle, deleteVehicle } from "../../services/api";
import placeholderImage from "../../assets/lorry.jpg";

export default function EditListed() {
  const { user } = useAuth0();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editFields, setEditFields] = useState({
    vehicleType: "",
    licensePlate: "",
    loadCapacity: "",
    pricePerKm: "",
    file: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        // Use backend filtering instead of client-side filtering
        const data = await getVehicles(user.sub);
        setVehicles(data);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        setError("Failed to load vehicles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [user]);

  // Open modal and populate fields
  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setEditFields({
      vehicleType: vehicle.vehicleType,
      licensePlate: vehicle.licensePlate,
      loadCapacity: vehicle.loadCapacity,
      pricePerKm: vehicle.pricePerKm || "",
      file: null,
    });
    setShowModal(true);
    setSaveError(null);
  };

  // Remove vehicle handler
  const handleRemove = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to remove this vehicle?")) return;
    try {
      await deleteVehicle(vehicleId);
      setVehicles((prev) => prev.filter((v) => v._id !== vehicleId));
    } catch (err) {
      alert("Failed to remove vehicle.");
    }
  };

  // Handle input changes in modal
  const handleFieldChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setEditFields((prev) => ({ ...prev, file: files[0] }));
    } else {
      setEditFields((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const updated = await updateVehicle(selectedVehicle._id, editFields);
      setVehicles((prev) =>
        prev.map((v) => (v._id === updated._id ? updated : v))
      );
      setShowModal(false);
    } catch (err) {
      setSaveError(
        err.response?.data?.message || "Failed to update vehicle. Try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      background: '#f9f9f9',
      minHeight: "100vh",
      py: 3
    }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: { xs: 2, md: 3 }, textAlign: 'center' }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1565c0',
              mb: 0.5,
              fontSize: { xs: 22, md: 24 }
            }}
          >
            Edit Listed Vehicles
          </Typography>
          <Typography variant="body2" color="#1565c0" sx={{ fontWeight: 400, fontSize: { xs: 15, md: 16 } }}>
            Manage your transport vehicles
          </Typography>
        </Box>

        {vehicles.length === 0 ? (
          <Paper
            elevation={0}
            sx={{ 
              p: 4, 
              textAlign: 'center',
              background: 'rgba(255,255,255,0.9)',
              border: "1px solid #E5E7EB",
              borderRadius: 3
            }}
          >
            <VehicleIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
              No vehicles added yet
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#888' }}>
              Add your first vehicle to start receiving booking requests
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/transporter/add-vehicle")}
              sx={{
                bgcolor: '#1565c0',
                color: 'white',
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#1976d2',
                }
              }}
            >
              Add Vehicle
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {vehicles.map((vehicle) => (
              <Grid item xs={12} sm={6} md={4} key={vehicle._id}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    background: 'rgba(255,255,255,0.9)',
                    border: "1px solid #E5E7EB",
                    borderRadius: 3,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={vehicle.image || placeholderImage}
                    alt={vehicle.vehicleType}
                    onError={(e) => {
                      e.target.src = placeholderImage;
                    }}
                    sx={{ 
                      objectFit: 'cover',
                      borderRadius: '12px 12px 0 0'
                    }}
                  />

                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#1565c0',
                        mb: 1,
                        fontSize: 18
                      }}
                    >
                      {vehicle.vehicleType}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666', 
                        mb: 1,
                        fontWeight: 500
                      }}
                    >
                      License: {vehicle.licensePlate}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666', 
                        mb: 1
                      }}
                    >
                      Capacity: {vehicle.loadCapacity}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#2e7d32',
                        fontWeight: 600,
                        fontSize: 16
                      }}
                    >
                      LKR {vehicle.pricePerKm ? parseFloat(vehicle.pricePerKm).toFixed(2) : 'N/A'}/km
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(vehicle)}
                      sx={{
                        flex: 1,
                        borderColor: '#1565c0',
                        color: '#1565c0',
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: '#1976d2',
                          bgcolor: 'rgba(21, 101, 192, 0.04)'
                        }
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleRemove(vehicle._id)}
                      sx={{
                        flex: 1,
                        ml: 1,
                        borderColor: '#d32f2f',
                        color: '#d32f2f',
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: '#c62828',
                          bgcolor: 'rgba(211, 47, 47, 0.04)'
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Edit Modal */}
        <Dialog 
          open={showModal} 
          onClose={() => setShowModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center',
            borderBottom: '1px solid #E5E7EB',
            pb: 2
          }}>
            <Avatar 
              sx={{ 
                background: '#1976d2',
                width: 40,
                height: 40,
                mr: 2
              }}
            >
              <EditIcon fontSize="small" />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1565c0' }}>
              Edit Vehicle
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            {saveError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {saveError}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Vehicle Type"
                  name="vehicleType"
                  value={editFields.vehicleType}
                  onChange={handleFieldChange}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="License Plate"
                  name="licensePlate"
                  value={editFields.licensePlate}
                  onChange={handleFieldChange}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Load Capacity"
                  name="loadCapacity"
                  value={editFields.loadCapacity}
                  onChange={handleFieldChange}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Price per KM (LKR)"
                  name="pricePerKm"
                  type="number"
                  inputProps={{ step: "0.01" }}
                  value={editFields.pricePerKm}
                  onChange={handleFieldChange}
                  placeholder="Enter price per kilometer"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Change Image (optional)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ py: 1.5, textTransform: 'none' }}
                >
                  Choose File
                  <input
                    type="file"
                    name="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFieldChange}
                    hidden
                  />
                </Button>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button 
              onClick={() => setShowModal(false)} 
              disabled={isSaving}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained"
              onClick={handleSave} 
              disabled={isSaving}
              sx={{
                bgcolor: '#1565c0',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#1976d2',
                }
              }}
              startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
