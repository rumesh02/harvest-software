import React, { useState } from "react";

const ListNewItem = () => {
  const [formData, setFormData] = useState({
    harvestType: "",
    harvestName: "",
    minBidPrice: "",
    availableWeight: "",
    images: [],
  });

  const [dragActive, setDragActive] = useState(false);

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
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

  return (
    <div className="bg-white p-4 rounded">
      <h5 className="mb-4">List New Item</h5>
      <p className="text-muted mb-4">Add Your Harvest Here</p>

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

        <button type="submit" className="btn btn-success w-100">
          Add Listing
        </button>
      </form>
    </div>
  );
};

export default ListNewItem;