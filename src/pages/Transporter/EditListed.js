import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EditListed.css";
import { getVehicles, updateVehicle, deleteVehicle } from "../../services/api";
import placeholderImage from "../../assets/lorry.jpg"; // Fallback image

export default function EditListed() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editFields, setEditFields] = useState({
    vehicleType: "",
    licensePlate: "",
    loadCapacity: "",
    file: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await getVehicles();
        setVehicles(data);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        setError("Failed to load vehicles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Open modal and populate fields
  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setEditFields({
      vehicleType: vehicle.vehicleType,
      licensePlate: vehicle.licensePlate,
      loadCapacity: vehicle.loadCapacity,
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
    return <div className="loading">Loading vehicles...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="container">
      <h1 className="title">Edit Listed Vehicles</h1>

      {vehicles.length === 0 ? (
        <div className="no-vehicles">
          <p>You haven't added any vehicles yet.</p>
          <button
            className="add-vehicle-btn"
            onClick={() => navigate("/transporter/add-vehicle")}
          >
            Add Vehicle
          </button>
        </div>
      ) : (
        <div className="grid-container">
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="card" style={{ position: "relative" }}>
              <div className="image-container">
                <img
                  src={vehicle.image || placeholderImage}
                  alt={vehicle.vehicleType}
                  className="lorry-image"
                  onError={(e) => {
                    e.target.src = placeholderImage;
                  }}
                />
              </div>

              <hr className="divider" />

              <div className="vehicle-details">
                <p className="vehicle-type">{vehicle.vehicleType}</p>
                <p className="license-plate">{vehicle.licensePlate}</p>
                <p className="load-capacity">
                  Capacity: {vehicle.loadCapacity}
                </p>
              </div>

              <div className="card-actions" style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "8px" }}>
                <button
                  className="edit-button"
                  onClick={() => handleEdit(vehicle)}
                  style={{ flex: 1 }}
                >
                  Edit
                </button>
                <button
                  className="remove-button"
                  onClick={() => handleRemove(vehicle._id)}
                  style={{ flex: 1, background: "#ff4d4f", color: "#fff" }}
                >
                  Remove
                </button>
              </div>

              {/* Inline Edit Popup */}
              {showModal && selectedVehicle && selectedVehicle._id === vehicle._id && (
                <div className="popup-edit-card">
                  <h2>Edit Vehicle</h2>
                  {saveError && <div className="error">{saveError}</div>}
                  <label>Vehicle Type</label>
                  <input
                    type="text"
                    name="vehicleType"
                    value={editFields.vehicleType}
                    onChange={handleFieldChange}
                  />
                  <label>License Plate</label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={editFields.licensePlate}
                    onChange={handleFieldChange}
                  />
                  <label>Load Capacity</label>
                  <input
                    type="text"
                    name="loadCapacity"
                    value={editFields.loadCapacity}
                    onChange={handleFieldChange}
                  />
                  <label>Change Image (optional)</label>
                  <input
                    type="file"
                    name="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFieldChange}
                  />
                  <div className="modal-actions">
                    <button onClick={() => setShowModal(false)} disabled={isSaving}>
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
