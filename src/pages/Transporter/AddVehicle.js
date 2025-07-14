import React, { useState } from "react";
import "./AddVehicle.css";
import { UploadCloud } from "lucide-react";
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
    <div>
      <h1>Add New</h1>
      <div className="form-container">
      <h2>Add Your New Vehicle</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">Vehicle added successfully!</p>}
      <form onSubmit={handleSubmit}>
        <label>Vehicle Type</label>
        <input
          type="text"
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          required
        />

        <label>License Plate</label>
        <input
          type="text"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          required
        />

        <label className="upload-label">Upload Vehicle Photo</label>
        <div
          className="file-upload-box"
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
              <p className="file-name">{file.name}</p>
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

        <label>Load Capacity</label>
        <input
          type="text"
          value={loadCapacity}
          onChange={(e) => setLoadCapacity(e.target.value)}
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding Vehicle..." : "Submit"}
        </button>
      </form>
      </div>
    </div>
  );
};

export default AddVehicle;