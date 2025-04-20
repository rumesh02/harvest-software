import React, { useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const ListNewItem = () => {
  const [formData, setFormData] = useState({
    harvestType: "",
    harvestName: "",
    minBidPrice: "",
    availableWeight: "",
    images: [],
  });

  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const { user } = useAuth0();

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      if (!formData.images || formData.images.length === 0) {
        throw new Error("Please select at least one image");
      }

      // Convert first image to base64
      const imageFile = formData.images[0];
      const base64Image = await convertImageToBase64(imageFile);

      // Validate form data
      if (!formData.harvestType || !formData.harvestName || 
          !formData.minBidPrice || !formData.availableWeight) {
        throw new Error("Please fill in all required fields");
      }

      const productData = {
        type: formData.harvestType,
        name: formData.harvestName,
        price: Number(formData.minBidPrice),
        quantity: Number(formData.availableWeight),
        image: base64Image,
        farmerID: user.sub // Use the authenticated user's ID
      };

      console.log("Attempting to submit product:", productData);

      // Add error handling and timeout
      const response = await axios.post(
        "http://localhost:5000/api/products",
        productData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000, // 5 second timeout
        }
      );

      console.log("Server response:", response.data);

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
          images: []
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
      images: []
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
            />
          </div>
        </div>

        {/* Minimum Bid Price & Available Weight */}
        <div className="row mb-4">
          <div className="col-md-6">
            <label className="form-label">Minimum Bid Price</label>
            <div className="input-group">
              <span className="input-group-text" style={{ fontSize: "14px", height: "38px" }}>
                Rs.
              </span>
              <input
                type="number"
                className="form-control"
                value={formData.minBidPrice}
                onChange={(e) =>
                  setFormData({ ...formData, minBidPrice: e.target.value })
                }
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
              />
              <span className="input-group-text" style={{ fontSize: "14px", height: "38px" }}>
                Kg
              </span>
            </div>
          </div>
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
                <li key={index} className="list-group-item">
                  {file.name}
                </li>
              ))}
            </ul>
          )}
        </div>

<div className="d-flex gap-2">
  <button 
    type="submit" 
    className="btn btn-success flex-grow-1" 
    disabled={isSubmitting}
  >
    {isSubmitting ? "Adding..." : "Add Listing"}
  </button>
  <button 
    type="button" 
    className="btn btn-secondary" 
    onClick={handleReset}
  >
    Reset Form
  </button>
</div>
      </form>
    </div>
  );
};

export default ListNewItem;