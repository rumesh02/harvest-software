import React, { useState } from "react";
import { addVehicle } from "../../services/api";
import { useAuth0 } from "@auth0/auth0-react";
import "./AddVehicle.css";

const AddVehicle = () => {
  const { user, isAuthenticated } = useAuth0();
  const [vehicleType, setVehicleType] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [loadCapacity, setLoadCapacity] = useState("");
  const [pricePerKm, setPricePerKm] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!isAuthenticated || !user) {
      setError("Please log in to add a vehicle");
      setIsSubmitting(false);
      return;
    }

    try {
      if (!file) {
        setError("Please upload a vehicle image");
        setIsSubmitting(false);
        return;
      }

      const vehicleData = {
        vehicleType,
        licensePlate,
        loadCapacity,
        pricePerKm: parseFloat(pricePerKm),
        transporterId: user.sub,
        district: user['https://your-app/district'] || "Colombo",
        file
      };

      await addVehicle(vehicleData);

      setVehicleType("");
      setLicensePlate("");
      setLoadCapacity("");
      setPricePerKm("");
      setFile(null);
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      console.error("Failed to add vehicle:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to add vehicle. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-vehicle-container">
      <div className="add-vehicle-content">
        {/* Header Section */}
        <div className="add-vehicle-header">
          <h1 className="add-vehicle-title">
            Add New Vehicle
          </h1>
          <p className="add-vehicle-subtitle">
            Register your transport vehicle for booking requests
          </p>
        </div>

        <div className="add-vehicle-paper">
          <div className="vehicle-info-header">
            <div className="vehicle-info-avatar">
              🚚
            </div>
            <h2 className="vehicle-info-title">
              Vehicle Information
            </h2>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              Vehicle added successfully!
            </div>
          )}

          <form className="add-vehicle-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Row 1: Vehicle Type only */}
              <div className="form-field">
                <span className="field-label">Vehicle Type *</span>
                <input
                  className="text-field"
                  type="text"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  required
                  placeholder="Enter vehicle type"
                />
              </div>

              {/* Row 2: License Plate only */}
              <div className="form-field">
                <span className="field-label">License Plate *</span>
                <input
                  className="text-field"
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  required
                  placeholder="Enter license plate"
                />
              </div>

              {/* Row 3: Load Capacity only */}
              <div className="form-field">
                <span className="field-label">Load Capacity *</span>
                <input
                  className="text-field"
                  type="text"
                  value={loadCapacity}
                  onChange={(e) => setLoadCapacity(e.target.value)}
                  required
                  placeholder="Enter load capacity"
                />
              </div>

              {/* Row 4: Price per KM only */}
              <div className="form-field">
                <span className="field-label">Price per KM (LKR) *</span>
                <input
                  className="text-field"
                  type="number"
                  step="0.01"
                  value={pricePerKm}
                  onChange={(e) => setPricePerKm(e.target.value)}
                  placeholder="Enter price per kilometer"
                  required
                />
              </div>

              <div className="form-field">
                <h3 className="upload-section-title">
                  Upload Vehicle Photo
                </h3>
                <div
                  className="upload-area"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('fileUpload').click()}
                >
                  <input
                    type="file"
                    id="fileUpload"
                    className="hidden-input"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                  />
                  <div className="upload-icon">📁</div>
                  {file ? (
                    <div className="file-name">
                      {file.name}
                    </div>
                  ) : (
                    <>
                      <div className="upload-text">
                        <span className="upload-text-bold">Click to upload</span> or{" "}
                        <span className="upload-text-highlight">drag and drop</span>
                      </div>
                      <div className="upload-caption">
                        JPG, JPEG, PNG less than 1MB
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="form-field">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="loading-spinner"></div>
                      Adding Vehicle...
                    </>
                  ) : (
                    <>
                      🚚 Add Vehicle
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVehicle;