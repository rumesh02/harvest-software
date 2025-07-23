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
import "./EditListed.css";

export default function EditListed() {
  const { user } = useAuth0();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await getVehicles(user.sub);
        setVehicles(data);
      } catch (err) {
        setError("Failed to load vehicles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [user]);

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setEditFields({
      vehicleType: vehicle.vehicleType,
      licensePlate: vehicle.licensePlate,
      loadCapacity: vehicle.loadCapacity,
      pricePerKm: vehicle.pricePerKm || "",
      file: null,
    });
    setSaveError(null);
    setShowModal(true);
  };

  const handleRemove = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to remove this vehicle?")) return;
    try {
      await deleteVehicle(vehicleId);
      setVehicles((prev) => prev.filter((v) => v._id !== vehicleId));
    } catch {
      alert("Failed to remove vehicle.");
    }
  };

  const handleFieldChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setEditFields((prev) => ({ ...prev, file: files[0] }));
    } else {
      setEditFields((prev) => ({ ...prev, [name]: value }));
    }
  };

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
      setSaveError(err?.response?.data?.message || "Failed to update vehicle.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box mb={4}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1565c0', display: 'flex', alignItems: 'center', gap: 1 }}>
            <VehicleIcon fontSize="large" /> My Listed Vehicles
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your listed vehicles
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

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
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/transporter/add-vehicle")}>
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
                  <Card elevation={2} sx={{ borderRadius: 2, background: 'white' }}>
                    <CardMedia component="img" height="100" image={vehicle.image || placeholderImage} alt={vehicle.vehicleType} onError={(e) => e.target.src = placeholderImage} />
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1565c0', textAlign: 'center' }}>
                        {vehicle.vehicleType}
                      </Typography>
                      <Typography variant="body2">License: {vehicle.licensePlate}</Typography>
                      <Typography variant="body2">Capacity: {vehicle.loadCapacity}</Typography>
                      <Typography variant="body2">Price/KM: {vehicle.pricePerKm ? `LKR ${Number(vehicle.pricePerKm).toFixed(2)}` : 'N/A'}</Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'center' }}>
                      <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(vehicle)}>Edit</Button>
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleRemove(vehicle._id)}>Remove</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ background: '#1565c0', color: 'white' }}>
            <Box display="flex" alignItems="center"><EditIcon sx={{ mr: 1 }} /> Edit Vehicle</Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 2, px: 3 }}>
            {saveError && <Alert severity="error" sx={{ mb: 3 }}>{saveError}</Alert>}
            {["vehicleType", "licensePlate", "loadCapacity", "pricePerKm"].map((field, idx) => (
              <TextField
                key={field}
                label={field === "pricePerKm" ? "Price per KM (LKR)" : field.charAt(0).toUpperCase() + field.slice(1)}
                fullWidth
                margin="normal"
                name={field}
                type={field === "pricePerKm" ? "number" : "text"}
                inputProps={field === "pricePerKm" ? { step: "0.01" } : {}}
                value={editFields[field]}
                onChange={handleFieldChange}
              />
            ))}
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>Change Image (optional)</Typography>
              <Button variant="outlined" component="label" fullWidth>
                Choose File
                <input type="file" name="file" accept="image/png, image/jpeg" hidden onChange={handleFieldChange} />
              </Button>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setShowModal(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} variant="contained" disabled={isSaving} startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}>
              {is
