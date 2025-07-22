import React, { useState } from "react";
import "./AddVehicle.css";
import { UploadCloud, Truck, FileText, Scale, Camera } from "lucide-react";
import { addVehicle } from "../../services/api";
import { useAuth0 } from "@auth0/auth0-react";

const AddVehicle = () => {
  const { user } = useAuth0();
  const [vehicleType, setVehicleType] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [loadCapacity, setLoadCapacity] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success] = useState(false);

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
        transporterId: user.sub, // Auth0 user.sub
        district: user['https://your-app/district'] || "Colombo", // Replace with actual path or form value
        file
      };

      await addVehicle(vehicleData);

      setVehicleType("");
      setLicensePlate("");
      setLoadCapacity("");
      setFile(null);

      alert("Vehicle added successfully!");
      window.location.reload();

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
    <div className="add-vehicle-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Add New Vehicle</h1>
        <p>Register your transport vehicle to start receiving booking requests from merchants</p>
      </div>

      {/* Main Content */}
      <div className="form-container">
        {/* Form Section */}
        <div className="form-section">
          <h2>Vehicle Information</h2>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">Vehicle added successfully!</p>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <Truck className="label-icon" />
                Vehicle Type
              </label>
              <input
                type="text"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                placeholder="e.g., Pickup Truck, Van, Lorry"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FileText className="label-icon" />
                License Plate
              </label>
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                placeholder="e.g., ABC-1234"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Scale className="label-icon" />
                Load Capacity (kg)
              </label>
              <input
                type="number"
                value={loadCapacity}
                onChange={(e) => setLoadCapacity(e.target.value)}
                placeholder="e.g., 1000"
                required
              />
            </div>

            <div className="form-group">
              <label className="upload-label">
                <Camera className="label-icon" />
                Vehicle Photo
              </label>
              <div
                className={`file-upload-box ${file ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="fileUpload"
                  className="hidden-input"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                />
                <label htmlFor="fileUpload" className="upload-content">
                  <UploadCloud className="upload-icon" />
                  {file ? (
                    <div>
                      <p className="file-name">{file.name}</p>
                      <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <>
                      <p>
                        <span className="click-text">Click to upload</span> or{" "}
                        <span className="drag-text">drag and drop</span>
                      </p>
                      <p className="file-info">JPG, JPEG, PNG less than 1MB</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding Vehicle..." : "Add Vehicle"}
            </button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="preview-section">
          <h3>Vehicle Preview</h3>
          <div className="vehicle-preview">
            {file ? (
              <img 
                src={URL.createObjectURL(file)} 
                alt="Vehicle preview" 
              />
            ) : (
              <div style={{ 
                width: '100%', 
                height: '150px', 
                backgroundColor: '#f7fafc', 
                borderRadius: '8px', 
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #cbd5e0'
              }}>
                <Camera size={40} style={{ color: '#a0aec0' }} />
              </div>
            )}
            <div className="vehicle-info">
              <p><strong>Type:</strong> {vehicleType || "Not specified"}</p>
              <p><strong>License:</strong> {licensePlate || "Not specified"}</p>
              <p><strong>Capacity:</strong> {loadCapacity ? `${loadCapacity} kg` : "Not specified"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVehicle;