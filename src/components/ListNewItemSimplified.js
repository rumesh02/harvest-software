import React, { useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import LocationSelector from "../../components/LocationSelector";
import useLocationData from "../../hooks/useLocationData";

const ListNewItem = () => {
  const [formData, setFormData] = useState({
    harvestType: "",
    harvestName: "",
    minBidPrice: "",
    availableWeight: "",
    images: [],
    description: ""
  });

  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const { user } = useAuth0();

  // Use the custom location hook
  const {
    updateLocation,
    isValidLocation,
    getApiFormat
  } = useLocationData();

  // Handle location selection from LocationSelector component
  const handleLocationSelect = (locationInfo) => {
    updateLocation({
      coordinates: locationInfo.coordinates,
      address: locationInfo.address
    });
  };

  // Convert image to base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No file provided"));
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(new Error("Error converting image: " + error));
    });
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      // Validate form data
      if (!formData.harvestType || !formData.harvestName || 
          !formData.minBidPrice || !formData.availableWeight) {
        throw new Error("Please fill in all required fields");
      }

      if (!formData.images || formData.images.length === 0) {
        throw new Error("Please select at least one image");
      }

      if (!isValidLocation()) {
        throw new Error("Please select a location on the map");
      }

      // Convert first image to base64
      const imageFile = formData.images[0];
      const base64Image = await convertImageToBase64(imageFile);

      const locationInfo = getApiFormat();
      const productData = {
        type: formData.harvestType,
        name: formData.harvestName,
        price: Number(formData.minBidPrice),
        quantity: Number(formData.availableWeight),
        image: base64Image,
        farmerID: user.sub,
        description: formData.description,
        location: locationInfo
      };

      console.log("Submitting product:", productData);

      const response = await axios.post(
        "http://localhost:5000/api/products",
        productData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      if (response.status === 201) {
        setSubmitStatus({
          type: "success",
          message: "Product listed successfully!"
        });

        // Reset form
        setFormData({
          harvestType: "",
          harvestName: "",
          minBidPrice: "",
          availableWeight: "",
          images: [],
          description: ""
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      let errorMessage = "Failed to list product. ";
      
      if (error.code === "ECONNREFUSED") {
        errorMessage += "Cannot connect to server. Please check if the server is running.";
      } else if (error.code === "ETIMEDOUT") {
        errorMessage += "Connection timed out. Please try again.";
      } else if (error.response) {
        errorMessage += error.response.data.message || "Please try again.";
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      setSubmitStatus({
        type: "error",
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle File Selection
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setFormData({ ...formData, images: [...formData.images, ...files] });
  };

  // Handle Drag Over Event
  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  // Handle Drag Leave Event
  const handleDragLeave = () => {
    setDragActive(false);
  };

  // Handle Drop Event
  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const files = Array.from(event.dataTransfer.files);
    setFormData({ ...formData, images: [...formData.images, ...files] });
  };

  const handleReset = () => {
    setFormData({
      harvestType: "",
      harvestName: "",
      minBidPrice: "",
      availableWeight: "",
      images: [],
      description: ""
    });
    setSubmitStatus({ type: "", message: "" });
  };

  return (
    <div className="bg-white p-4 rounded">
      <h5 className="mb-4">List New Item</h5>
      <p className="text-muted mb-4">Add Your Harvest Here</p>

      {submitStatus.message && (
        <div
          className={`alert ${
            submitStatus.type === "success" 
              ? "alert-success" 
              : "alert-danger"
          } mb-4`}
        >
          {submitStatus.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Harvest Type & Name */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Harvest Type</label>
            <select
              className="form-select"
              value={formData.harvestType}
              onChange={(e) =>
                setFormData({ ...formData, harvestType: e.target.value })
              }
              required
            >
              <option value="">Select Harvest Type</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="grains">Grains</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Harvest Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.harvestName}
              onChange={(e) =>
                setFormData({ ...formData, harvestName: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* Minimum Bid Price & Available Weight */}
        <div className="row mb-4">
          <div className="col-md-6">
            <label className="form-label">Minimum Bid Price</label>
            <div className="input-group">
              <span className="input-group-text">Rs.</span>
              <input
                type="number"
                className="form-control"
                value={formData.minBidPrice}
                onChange={(e) =>
                  setFormData({ ...formData, minBidPrice: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label">Available Weight Of Stock</label>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                value={formData.availableWeight}
                onChange={(e) =>
                  setFormData({ ...formData, availableWeight: e.target.value })
                }
                required
              />
              <span className="input-group-text">Kg</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="form-label">Description (Optional)</label>
          <textarea
            className="form-control"
            rows="3"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Tell buyers about your harvest..."
          />
        </div>

        {/* File Upload Section */}
        <div className="mb-4">
          <label className="form-label">Upload Images Of Harvest</label>
          <div
            className={`border p-5 rounded text-center ${
              dragActive ? "border-primary" : "border-secondary"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="fileUpload"
              className="d-none"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
            <label
              htmlFor="fileUpload"
              style={{
                color: "black",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Click to Upload
            </label>
            <p className="mt-2 text-muted">or drag and drop your files here</p>
          </div>

          {/* Show Selected Files */}
          {formData.images.length > 0 && (
            <ul className="list-group mt-3">
              {formData.images.map((file, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  {file.name}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      const newImages = formData.images.filter((_, i) => i !== index);
                      setFormData({ ...formData, images: newImages });
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Location Selector */}
        <div className="mb-4">
          <LocationSelector
            onLocationSelect={handleLocationSelect}
            title="Select Harvest Location"
            showCurrentLocationButton={true}
            showAddressInput={true}
            showCoordinates={true}
            mapHeight="350px"
            autoDetectLocation={true}
          />
          
          {!isValidLocation() && (
            <div className="mt-2 text-warning">
              <small>⚠ Please select a location on the map or use your current location</small>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn btn-success flex-grow-1" 
            disabled={isSubmitting || !isValidLocation()}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Adding...
              </>
            ) : (
              "Add Listing"
            )}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default ListNewItem;
