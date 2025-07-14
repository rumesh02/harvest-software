import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";

const SRI_LANKA_CENTER = { lat: 7.8731, lng: 80.7718 };
// IMPORTANT: Set your Google Maps API key in a .env.local file as REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = { width: "100%", height: "300px" };

const ListNewItem = () => {
  const [formData, setFormData] = useState({
    harvestType: "",
    harvestName: "",
    minBidPrice: "",
    availableWeight: "",
    images: [],
    location: null, // { lat, lng }
    address: "",
    manualLat: "",
    manualLng: "",
    manualAddress: "",
  });

  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const [addressLoading, setAddressLoading] = useState(false);
  const { user } = useAuth0();
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // Helper: Get address from lat/lng using Google Geocoding API
  const getAddressFromLatLng = useCallback((lat, lng) => {
    if (!window.google) return;
    setAddressLoading(true);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      setAddressLoading(false);
      if (status === "OK" && results[0]) {
        setFormData((prev) => ({ ...prev, address: results[0].formatted_address }));
      } else {
        setFormData((prev) => ({ ...prev, address: "" }));
      }
    });
  }, []);

  // Auto-detect user location on mount
  useEffect(() => {
    if (!formData.location && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setFormData((prev) => ({ ...prev, location: coords }));
        getAddressFromLatLng(coords.lat, coords.lng);
        
        // Add marker after map loads
        setTimeout(() => {
          if (window.google && window.google.maps && window.google.maps.marker && mapRef.current) {
            try {
              const { AdvancedMarkerElement } = window.google.maps.marker;
              markerRef.current = new AdvancedMarkerElement({
                position: coords,
                map: mapRef.current,
                title: "Current Location"
              });
            } catch (error) {
              console.warn("AdvancedMarkerElement not available, falling back to basic marker:", error);
              // Fallback to basic marker if AdvancedMarkerElement is not available
              if (window.google.maps.Marker) {
                markerRef.current = new window.google.maps.Marker({
                  position: coords,
                  map: mapRef.current,
                  title: "Current Location"
                });
              }
            }
          }
        }, 1000);
      });
    }
    // eslint-disable-next-line
  }, []);

  // Cleanup marker on unmount
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
      }
    };
  }, []);

  // When map loads
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // When user clicks on map
  const handleMapClick = (e) => {
    const coords = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    console.log("Map clicked, coordinates:", coords);
    setFormData((prev) => ({ 
      ...prev, 
      location: coords,
      manualLat: coords.lat.toString(),
      manualLng: coords.lng.toString(),
      manualAddress: ""
    }));
    getAddressFromLatLng(coords.lat, coords.lng);
    
    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.map = null;
    }
    
    // Create new AdvancedMarkerElement
    if (window.google && window.google.maps && window.google.maps.marker) {
      try {
        const { AdvancedMarkerElement } = window.google.maps.marker;
        markerRef.current = new AdvancedMarkerElement({
          position: coords,
          map: mapRef.current,
          title: "Selected Location"
        });
      } catch (error) {
        console.warn("AdvancedMarkerElement not available, falling back to basic marker:", error);
        // Fallback to basic marker if AdvancedMarkerElement is not available
        if (window.google.maps.Marker) {
          markerRef.current = new window.google.maps.Marker({
            position: coords,
            map: mapRef.current,
            title: "Selected Location"
          });
        }
      }
    }
  };

  // Manual trigger for geolocation
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        console.log("Geolocation detected, coordinates:", coords);
        setFormData((prev) => ({ 
          ...prev, 
          location: coords,
          manualLat: coords.lat.toString(),
          manualLng: coords.lng.toString(),
          manualAddress: ""
        }));
        getAddressFromLatLng(coords.lat, coords.lng);
        
        // Remove existing marker
        if (markerRef.current) {
          markerRef.current.map = null;
        }
        
        // Create new AdvancedMarkerElement
        if (window.google && window.google.maps && window.google.maps.marker && mapRef.current) {
          try {
            const { AdvancedMarkerElement } = window.google.maps.marker;
            markerRef.current = new AdvancedMarkerElement({
              position: coords,
              map: mapRef.current,
              title: "Current Location"
            });
          } catch (error) {
            console.warn("AdvancedMarkerElement not available, falling back to basic marker:", error);
            // Fallback to basic marker if AdvancedMarkerElement is not available
            if (window.google.maps.Marker) {
              markerRef.current = new window.google.maps.Marker({
                position: coords,
                map: mapRef.current,
                title: "Current Location"
              });
            }
          }
        }
      });
    }
  };

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
      if (!formData.location) {
        throw new Error("Please select a location on the map");
      }

      const productData = {
        type: formData.harvestType,
        name: formData.harvestName,
        price: Number(formData.minBidPrice),
        quantity: Number(formData.availableWeight),
        image: base64Image,
        farmerID: user.sub, // Use the authenticated user's ID
        location: formData.location, // <-- include location
        address: formData.address, // <-- include address
      };

      console.log("Form data state:", formData);
      console.log("Attempting to submit product:", productData);

      // Add error handling and timeout
      const response = await axios.post(
        "http://localhost:5000/api/products",
        productData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000, // 1 minute timeout
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
          images: [],
          location: null,
          address: "",
          manualLat: "",
          manualLng: "",
          manualAddress: "",
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
      images: [],
      location: null,
      address: "",
      manualLat: "",
      manualLng: "",
      manualAddress: "",
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

        {/* Google Maps Location Picker */}
        <div className="mb-4">
          <label className="form-label">Select Harvest Location</label>
          <div style={{ height: "300px", width: "100%" }}>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={formData.location || SRI_LANKA_CENTER}
                zoom={12}
                onClick={handleMapClick}
                onLoad={onMapLoad}
                options={{
                  mapId: "DEMO_MAP_ID",
                }}
              />
            ) : (
              <div>Loading map...</div>
            )}
          </div>
          {addressLoading && (
            <div className="mt-2 text-muted">Fetching address…</div>
          )}
          {formData.location && (
            <div className="mt-2 text-info">
              <span role="img" aria-label="coordinates">📍</span> Coordinates: {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
            </div>
          )}
          {formData.address && !addressLoading && (
            <div className="mt-2 text-success">
              <span role="img" aria-label="map">🗺️</span> {formData.address}
            </div>
          )}
          <button type="button" className="btn btn-outline-primary mt-2" onClick={detectLocation}>
            Use My Current Location
          </button>
          {!formData.location && (
            <div className="mt-2 text-warning">
              <small>⚠️ Please select a location on the map, use your current location, or enter coordinates manually</small>
            </div>
          )}
          
          {/* Manual Address Input */}
          <div className="mt-3">
            <label className="form-label">Or Enter Your Address</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Enter your full address (e.g., 123 Main St, Colombo, Sri Lanka)"
                value={formData.manualAddress || ""}
                onChange={(e) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    manualAddress: e.target.value
                  }));
                }}
              />
              <button 
                type="button" 
                className="btn btn-outline-primary"
                onClick={() => {
                  if (formData.manualAddress && window.google) {
                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ address: formData.manualAddress }, (results, status) => {
                      if (status === "OK" && results[0]) {
                        const coords = {
                          lat: results[0].geometry.location.lat(),
                          lng: results[0].geometry.location.lng()
                        };
                        console.log("Address geocoded to coordinates:", coords);
                        setFormData(prev => ({ 
                          ...prev, 
                          location: coords,
                          address: results[0].formatted_address,
                          manualLat: coords.lat.toString(),
                          manualLng: coords.lng.toString()
                        }));
                        
                        // Update map marker
                        if (markerRef.current) {
                          markerRef.current.map = null;
                        }
                        
                        if (window.google && window.google.maps && window.google.maps.marker && mapRef.current) {
                          try {
                            const { AdvancedMarkerElement } = window.google.maps.marker;
                            markerRef.current = new AdvancedMarkerElement({
                              position: coords,
                              map: mapRef.current,
                              title: "Address Location"
                            });
                          } catch (error) {
                            console.warn("AdvancedMarkerElement not available, falling back to basic marker:", error);
                            if (window.google.maps.Marker) {
                              markerRef.current = new window.google.maps.Marker({
                                position: coords,
                                map: mapRef.current,
                                title: "Address Location"
                              });
                            }
                          }
                        }
                      } else {
                        alert("Could not find the address. Please try a more specific address.");
                      }
                    });
                  }
                }}
                disabled={!formData.manualAddress}
              >
                Find Location
              </button>
            </div>
            <small className="text-muted">
              Enter your full address and click "Find Location" to automatically set coordinates
            </small>
          </div>
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