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
  Paper
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ fontWeight: 600, color: '#1565c0', display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <VehicleIcon fontSize="large" />
            My Listed Vehicles
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your listed vehicles
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {vehicles.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 8, bgcolor: '#f8f9fa' }}>
            <CardContent>
              <VehicleIcon sx={{ fontSize: 80, color: '#6c757d', mb: 2 }} />
              <Typography variant="h5" gutterBottom color="text.secondary">
                No Listed Vehicles
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                You haven't listed any vehicles yet. Start by adding your first vehicle!
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: '#1565c0',
                  '&:hover': {
                    backgroundColor: '#1976d2'
                  }
                }}
                onClick={() => navigate("/transporter/add-vehicle")}
              >
                Add Vehicle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              You have <strong>{vehicles.length}</strong> listed vehicle{vehicles.length !== 1 ? 's' : ''}
            </Alert>

            <Grid container spacing={3}>
              {vehicles.map((vehicle) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={vehicle._id}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      height: '100%',
                      borderRadius: 2,
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                      border: '1px solid #e3f2fd',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      maxWidth: 280,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(21, 101, 192, 0.12)',
                        '& .vehicle-image': {
                          transform: 'scale(1.03)',
                        }
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #1565c0, #1976d2)',
                        zIndex: 1
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                      <CardMedia
                        component="img"
                        height="100"
                        image={vehicle.image || placeholderImage}
                        alt={vehicle.vehicleType}
                        className="vehicle-image"
                        onError={(e) => {
                          e.target.src = placeholderImage;
                        }}
                        sx={{ 
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          backgroundColor: vehicle.isAvailable ? 'rgba(40, 167, 69, 0.9)' : 'rgba(220, 53, 69, 0.9)',
                          color: 'white',
                          px: 0.8,
                          py: 0.2,
                          borderRadius: 0.8,
                          fontSize: '0.65rem',
                          fontWeight: 600,
                        }}
                      >
                        {vehicle.isAvailable ? 'Available' : 'Busy'}
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 1.5, pb: 0.5 }}>
                      {/* Vehicle Name/Type - Header */}
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600, 
                          color: '#1565c0',
                          mb: 1,
                          fontSize: '1rem',
                          textAlign: 'center',
                          borderBottom: '1px solid #e3f2fd',
                          pb: 0.3
                        }}
                      >
                        {vehicle.vehicleType}
                      </Typography>

                      {/* Compact Vehicle Details */}
                      <Box sx={{ mb: 1 }}>
                        {/* Vehicle Number */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          mb: 0.7,
                          p: 0.6,
                          backgroundColor: '#f8f9fa',
                          borderRadius: 0.8,
                          border: '1px solid #e9ecef'
                        }}>
                          <Box sx={{ 
                            backgroundColor: '#1565c0',
                            borderRadius: 0.4,
                            p: 0.2,
                            mr: 0.8,
                            minWidth: 16,
                            height: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Typography sx={{ color: 'white', fontSize: '0.6rem', fontWeight: 'bold' }}>
                              #
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#6c757d', fontSize: '0.6rem', textTransform: 'uppercase' }}>
                              Vehicle No.
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#212529', fontSize: '0.7rem' }}>
                              {vehicle.licensePlate}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Load Capacity */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          mb: 0.7,
                          p: 0.6,
                          backgroundColor: '#f8f9fa',
                          borderRadius: 0.8,
                          border: '1px solid #e9ecef'
                        }}>
                          <Box sx={{ 
                            backgroundColor: '#28a745',
                            borderRadius: 0.4,
                            p: 0.2,
                            mr: 0.8,
                            minWidth: 16,
                            height: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Typography sx={{ color: 'white', fontSize: '0.6rem', fontWeight: 'bold' }}>
                              ⚖
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#6c757d', fontSize: '0.6rem', textTransform: 'uppercase' }}>
                              Capacity
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#212529', fontSize: '0.7rem' }}>
                              {vehicle.loadCapacity}
                            </Typography>
                          </Box>
                        </Box>

                        {/* District */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          mb: 0.7,
                          p: 0.6,
                          backgroundColor: '#f8f9fa',
                          borderRadius: 0.8,
                          border: '1px solid #e9ecef'
                        }}>
                          <Box sx={{ 
                            backgroundColor: '#ff9800',
                            borderRadius: 0.4,
                            p: 0.2,
                            mr: 0.8,
                            minWidth: 16,
                            height: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Typography sx={{ color: 'white', fontSize: '0.6rem', fontWeight: 'bold' }}>
                              📍
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#6c757d', fontSize: '0.6rem', textTransform: 'uppercase' }}>
                              District
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#212529', fontSize: '0.7rem' }}>
                              {vehicle.district || 'Not specified'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Price per KM - Compact */}
                      <Box sx={{ 
                        textAlign: 'center',
                        p: 0.8,
                        background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                        borderRadius: 0.8,
                        border: '1px solid #c8e6c9',
                        mb: 0.5
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: '#2e7d32', 
                          fontSize: '0.6rem', 
                          textTransform: 'uppercase',
                          fontWeight: 600,
                        }}>
                          Price per KM
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: '#1b5e20',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          mt: 0.1
                        }}>
                          LKR {vehicle.pricePerKm ? parseFloat(vehicle.pricePerKm).toFixed(2) : 'N/A'}
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ 
                      p: 1, 
                      pt: 0, 
                      gap: 0.5,
                      justifyContent: 'center'
                    }}>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(vehicle)}
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                          color: 'white',
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: 1,
                          px: 1.5,
                          py: 0.5,
                          fontSize: '0.7rem',
                          minHeight: 'auto',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #1456b3 0%, #1565c0 100%)',
                            transform: 'translateY(-1px)',
                          }
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleRemove(vehicle._id)}
                        size="small"
                        sx={{
                          borderColor: '#dc3545',
                          color: '#dc3545',
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: 1,
                          px: 1.5,
                          py: 0.5,
                          fontSize: '0.7rem',
                          minHeight: 'auto',
                          '&:hover': {
                            borderColor: '#c82333',
                            backgroundColor: 'rgba(220, 53, 69, 0.05)',
                            transform: 'translateY(-1px)',
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
          </>
        )}
      </Paper>

      {/* Edit Modal */}
      <Dialog 
        open={showModal} 
        onClose={() => setShowModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '95vh',
            overflow: 'hidden',
            background: "#f0f9ff"
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          pb: 2,
          background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
          color: 'white',
          position: 'relative'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <EditIcon sx={{ mr: 1, color: 'white' }} />
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', fontSize: '20px' }}>
              Edit Vehicle
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2, p: 3 }}>
          {saveError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {saveError}
            </Alert>
          )}

          <TextField
            label="Vehicle Type"
            fullWidth
            margin="normal"
            name="vehicleType"
            value={editFields.vehicleType}
            onChange={handleFieldChange}
            variant="outlined"
          />
          
          <TextField
            label="License Plate"
            fullWidth
            margin="normal"
            name="licensePlate"
            value={editFields.licensePlate}
            onChange={handleFieldChange}
            variant="outlined"
          />
          
          <TextField
            label="Load Capacity"
            fullWidth
            margin="normal"
            name="loadCapacity"
            value={editFields.loadCapacity}
            onChange={handleFieldChange}
            variant="outlined"
          />
          
          <TextField
            label="Price per KM (LKR)"
            type="number"
            fullWidth
            margin="normal"
            name="pricePerKm"
            inputProps={{ step: "0.01" }}
            value={editFields.pricePerKm}
            onChange={handleFieldChange}
            placeholder="Enter price per kilometer"
            variant="outlined"
          />
          
          <Box sx={{ mt: 2 }}>
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
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setShowModal(false)} 
            variant="outlined"
            disabled={isSaving}
            sx={{
              borderColor: '#64748b',
              color: '#64748b',
              '&:hover': { 
                borderColor: '#475569', 
                backgroundColor: '#f8fafc'
              },
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={isSaving}
            sx={{
              background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
              '&:hover': { 
                background: 'linear-gradient(135deg, #1456b3 0%, #1565c0 100%)'
              },
              textTransform: 'none',
              fontWeight: 600
            }}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
