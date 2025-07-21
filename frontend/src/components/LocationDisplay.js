import React, { useState, useEffect } from "react";

const LocationDisplay = ({ 
  location, 
  address = "",
  markerTitle = "Location"
}) => {
  const [displayLocation, setDisplayLocation] = useState(null);
  const [displayAddress, setDisplayAddress] = useState(address);

  // Update display location when location prop changes
  useEffect(() => {
    // Try to extract coordinates from different possible structures
    let coords = null;
    
    if (location) {
      // Direct lat/lng structure
      if (location.lat && location.lng) {
        coords = { lat: location.lat, lng: location.lng };
      }
      // Nested coordinates structure
      else if (location.coordinates && location.coordinates.lat && location.coordinates.lng) {
        coords = { lat: location.coordinates.lat, lng: location.coordinates.lng };
      }
      // Array format [lng, lat] (GeoJSON format)
      else if (Array.isArray(location.coordinates) && location.coordinates.length === 2) {
        coords = { lat: location.coordinates[1], lng: location.coordinates[0] };
      }
      // MongoDB GeoJSON format
      else if (location.type === 'Point' && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
        coords = { lat: location.coordinates[1], lng: location.coordinates[0] };
      }
    }
    
    if (coords && coords.lat && coords.lng) {
      setDisplayLocation(coords);
    } else {
      setDisplayLocation(null);
    }
    
    setDisplayAddress(address || "Location not available");
  }, [location, address]);

  // Function to open Google Maps in a new tab
  const openInGoogleMaps = () => {
    if (displayLocation && displayLocation.lat && displayLocation.lng) {
      const googleMapsUrl = `https://maps.google.com/?q=${displayLocation.lat},${displayLocation.lng}`;
      window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('Location coordinates not available');
    }
  };

  return (
    <div className="location-display-component">
      {/* Location Information */}
      <div style={{ 
        position: 'relative',
        zIndex: 1,
        background: 'white',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Address Display */}
        <div className="p-3 bg-light rounded mb-3">
          <small className="text-muted">
            <strong>📍 Address:</strong> {displayAddress}
          </small>
        </div>
        
        {/* Coordinates Display */}
        {displayLocation && displayLocation.lat && displayLocation.lng && (
          <div className="p-3 bg-light rounded mb-3">
            <small className="text-muted">
              <strong>🌐 Coordinates:</strong> {displayLocation.lat.toFixed(6)}, {displayLocation.lng.toFixed(6)}
            </small>
          </div>
        )}
        
        {/* Google Maps Button */}
        <div className="text-center">
          <button
            type="button"
            className="btn btn-primary"
            onClick={openInGoogleMaps}
            disabled={!displayLocation || !displayLocation.lat || !displayLocation.lng}
            style={{
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontWeight: '600',
              fontSize: '16px',
              boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              if (!e.target.disabled) {
                e.target.style.background = 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)';
                e.target.style.boxShadow = '0 6px 20px rgba(25, 118, 210, 0.4)';
                e.target.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={(e) => {
              if (!e.target.disabled) {
                e.target.style.background = 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)';
                e.target.style.boxShadow = '0 4px 15px rgba(25, 118, 210, 0.3)';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {displayLocation && displayLocation.lat && displayLocation.lng ? (
              <>
                <i className="fas fa-map-marker-alt me-2"></i>
                Show on Google Maps
              </>
            ) : (
              <>
                <i className="fas fa-exclamation-triangle me-2"></i>
                Location Not Available
              </>
            )}
          </button>
        </div>
        
        {/* Additional Info */}
        <div className="text-center mt-3">
          <small className="text-muted">
            {displayLocation && displayLocation.lat && displayLocation.lng 
              ? "Click the button above to view this location on Google Maps"
              : "Location coordinates are not available for this address"
            }
          </small>
        </div>
      </div>
    </div>
  );
};

export default LocationDisplay;
