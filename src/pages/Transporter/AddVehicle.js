import React, { useState } from "react";
import "./AddVehicle.css";
import { UploadCloud } from "lucide-react";

const AddVehicle = () => {
  const [vehicleType, setVehicleType] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [loadCapacity, setLoadCapacity] = useState("");
  const [file, setFile] = useState(null);

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

    const formData = new FormData();
    formData.append("vehicleType", vehicleType);
    formData.append("licensePlate", licensePlate);
    formData.append("loadCapacity", loadCapacity);
    if (file) {
      formData.append("vehicleImage", file);
    }

    try {
      const response = await fetch("http://localhost:5000/api/vehicles", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (response.ok) {
        alert("Vehicle Added Successfully!");
        setVehicleType("");
        setLicensePlate("");
        setLoadCapacity("");
        setFile(null);
      } else {
        alert("Failed to add vehicle.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div>
      <h1>Add New</h1>
      <div className="form-container">
        <h2>Add Your New Vehicle</h2>
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

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;
