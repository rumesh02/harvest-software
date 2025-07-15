import React, { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, Marker, Autocomplete } from "@react-google-maps/api";
import { GOOGLE_API_KEY } from "../config";
import { DEFAULT_MAP_CENTER } from "../config/googleMaps";
import { useGoogleMaps } from "../config/GoogleMapsProvider";

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
  border: '1px solid #ddd'
};

const LocateMe = ({ 
  onLocationSelect, 
  initialLocation, 
  buttonText = "Get Current Location",
  className = "",
  showMap = true,
  mapHeight = "400px"
}) => {
  const { isLoaded } = useGoogleMaps();
  
  // State management
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || DEFAULT_MAP_CENTER);
  const [hasSelectedLocation, setHasSelectedLocation] = useState(
    !!(initialLocation && initialLocation.lat && initialLocation.lng && initialLocation !== DEFAULT_MAP_CENTER)
  ); // Track if user has actually selected a location
  const [address, setAddress] = useState("");
  const [currentLocationAddress, setCurrentLocationAddress] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [infoWindow, setInfoWindow] = useState(null);
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Custom map container style based on props
  const mapContainerStyle = {
    ...MAP_CONTAINER_STYLE,
    height: mapHeight
  };

  // Debug logging
  useEffect(() => {
    console.log('LocateMe - Selected location:', selectedLocation);
    console.log('LocateMe - Current location:', currentLocation);
    console.log('LocateMe - Google Maps loaded:', !!window.google);
    console.log('LocateMe - Places library loaded:', !!(window.google && window.google.maps && window.google.maps.places));
    console.log('LocateMe - isLoaded:', isLoaded);
    console.log('LocateMe - Marker should be visible:', !!(selectedLocation && selectedLocation.lat && selectedLocation.lng));
    
    // Additional debugging for marker visibility
    if (selectedLocation) {
      console.log('LocateMe - Selected location details:', {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        isValidLat: typeof selectedLocation.lat === 'number' && !isNaN(selectedLocation.lat),
        isValidLng: typeof selectedLocation.lng === 'number' && !isNaN(selectedLocation.lng)
      });
    }
  }, [selectedLocation, currentLocation, isLoaded]);

  // Update selected location when initialLocation prop changes
  useEffect(() => {
    if (initialLocation && initialLocation.lat && initialLocation.lng) {
      setSelectedLocation(initialLocation);
      // Only set hasSelectedLocation to true if it's not the default center
      setHasSelectedLocation(
        initialLocation.lat !== DEFAULT_MAP_CENTER.lat || 
        initialLocation.lng !== DEFAULT_MAP_CENTER.lng
      );
    }
  }, [initialLocation]);

  // Check for places library availability
  useEffect(() => {
    if (isLoaded) {
      const checkPlacesLibrary = () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          console.log('LocateMe - Places library is available');
        } else {
          console.warn('LocateMe - Places library is not available, falling back to geocoding');
        }
      };
      
      // Check immediately
      checkPlacesLibrary();
      
      // Also check after a short delay in case it's still loading
      setTimeout(checkPlacesLibrary, 1000);
    }
  }, [isLoaded]);

  // Map load callback
  const onLoad = useCallback((map) => {
    mapRef.current = map;
    
    // Create info window for place details
    const infoWindowInstance = new window.google.maps.InfoWindow();
    setInfoWindow(infoWindowInstance);
    
    console.log('LocateMe - Map loaded successfully');
  }, []);

  // Handle place selection from search
  const onPlaceChanged = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (!place.geometry || !place.geometry.location) {
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      const newLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };

      setSelectedLocation(newLocation);
      setAddress(place.formatted_address || place.name);
      setSearchQuery(place.formatted_address || place.name || ""); // Update search query
      setHasSelectedLocation(true); // Mark that user has selected a location

      // Update map view
      if (mapRef.current) {
        if (place.geometry.viewport) {
          mapRef.current.fitBounds(place.geometry.viewport);
        } else {
          mapRef.current.setCenter(newLocation);
          mapRef.current.setZoom(17);
        }
      }

      // Show info window with place details
      if (infoWindow && mapRef.current) {
        infoWindow.setContent(
          `<div>
            <strong>${place.name || 'Selected Location'}</strong><br>
            <span>${place.formatted_address || 'Address not available'}</span>
          </div>`
        );
        infoWindow.setPosition(newLocation);
        infoWindow.open(mapRef.current);
      }

      // Call parent callback
      onLocationSelect({
        coordinates: newLocation,
        address: place.formatted_address || place.name || `${newLocation.lat.toFixed(6)}, ${newLocation.lng.toFixed(6)}`
      });

      console.log("Place selected:", place.name, newLocation.lat, newLocation.lng);
    }
  }, [infoWindow, onLocationSelect]);

  // Handle autocomplete load
  const onAutocompleteLoad = useCallback((autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);

  // Fallback search function using geocoding API
  const handleManualSearch = useCallback(async (query) => {
    if (!query.trim() || !window.google || !window.google.maps) return;

    const geocoder = new window.google.maps.Geocoder();
    
    try {
      geocoder.geocode({ 
        address: query,
        componentRestrictions: { country: 'LK' }
      }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const place = results[0];
          const newLocation = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };

          setSelectedLocation(newLocation);
          setAddress(place.formatted_address);
          setHasSelectedLocation(true); // Mark that user has selected a location

          // Update map view
          if (mapRef.current) {
            if (place.geometry.viewport) {
              mapRef.current.fitBounds(place.geometry.viewport);
            } else {
              mapRef.current.setCenter(newLocation);
              mapRef.current.setZoom(15);
            }
          }

          // Call parent callback
          onLocationSelect({
            coordinates: newLocation,
            address: place.formatted_address
          });

          console.log("Manual search result:", place.formatted_address, newLocation.lat, newLocation.lng);
        } else {
          alert("Location not found. Please try a different search term.");
        }
      });
    } catch (error) {
      console.error("Search error:", error);
      alert("Search failed. Please try again.");
    }
  }, [onLocationSelect]);

  // Handle Enter key press for manual search
  const handleSearchKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleManualSearch(searchQuery);
    }
  }, [searchQuery, handleManualSearch]);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Get current location function
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setCurrentLocation(newLocation);
          setSelectedLocation(newLocation);
          setHasSelectedLocation(true); // Mark that user has selected a location
          setIsLoadingLocation(false);
          
          // Pan map to current location and zoom in
          if (mapRef.current) {
            mapRef.current.panTo(newLocation);
            mapRef.current.setZoom(15);
          }
          
          // Get address for current location (store separately)
          reverseGeocodeForCurrentLocation(newLocation);
          
          // Log coordinates when location is obtained (similar to original dragend)
          console.log("Current location obtained:", newLocation.lat, newLocation.lng);
        },
        (error) => {
          console.error("Error getting current location:", error);
          setIsLoadingLocation(false);
          alert("Unable to get your current location. Please select manually on the map.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Reverse geocoding function for current location
  const reverseGeocodeForCurrentLocation = useCallback((location) => {
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const formattedAddress = results[0].formatted_address;
          setCurrentLocationAddress(formattedAddress);
          // Also set as selected location address since current location becomes selected
          setAddress(formattedAddress);
          onLocationSelect({
            coordinates: location,
            address: formattedAddress
          });
        } else {
          console.warn('Geocoding failed:', status);
          const fallbackAddress = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
          setCurrentLocationAddress(fallbackAddress);
          setAddress(fallbackAddress);
          onLocationSelect({
            coordinates: location,
            address: fallbackAddress
          });
        }
      });
    } else {
      // If geocoder is not available, just send coordinates
      const fallbackAddress = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
      setCurrentLocationAddress(fallbackAddress);
      setAddress(fallbackAddress);
      onLocationSelect({
        coordinates: location,
        address: fallbackAddress
      });
    }
  }, [onLocationSelect]);

  // Reverse geocoding function
  const reverseGeocode = useCallback((location) => {
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const formattedAddress = results[0].formatted_address;
          setAddress(formattedAddress);
          onLocationSelect({
            coordinates: location,
            address: formattedAddress
          });
        } else {
          console.warn('Geocoding failed:', status);
          const fallbackAddress = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
          setAddress(fallbackAddress);
          onLocationSelect({
            coordinates: location,
            address: fallbackAddress
          });
        }
      });
    } else {
      // If geocoder is not available, just send coordinates
      const fallbackAddress = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
      setAddress(fallbackAddress);
      onLocationSelect({
        coordinates: location,
        address: fallbackAddress
      });
    }
  }, [onLocationSelect]);

  // Handle marker drag end (from original Google Maps dragend listener)
  const onMarkerDragEnd = useCallback((event) => {
    if (!event || !event.latLng) {
      console.error('Invalid drag event');
      return;
    }
    
    const newLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    
    setSelectedLocation(newLocation);
    setHasSelectedLocation(true); // Mark that user has selected a location
    
    // Close info window if open
    if (infoWindow) {
      infoWindow.close();
    }
    
    // Log coordinates when drag ends (similar to original code)
    console.log("Marker dragged to:", newLocation.lat, newLocation.lng);
    
    // Reverse geocode the new location
    reverseGeocode(newLocation);
  }, [reverseGeocode, infoWindow]);

  // Handle map click to place marker
  const onMapClick = useCallback((event) => {
    if (!event || !event.latLng) {
      console.error('Invalid click event');
      return;
    }
    
    const newLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    
    setSelectedLocation(newLocation);
    setHasSelectedLocation(true); // Mark that user has selected a location
    
    // Close info window if open
    if (infoWindow) {
      infoWindow.close();
    }
    
    // Zoom and center on click (similar to original marker click)
    if (mapRef.current) {
      mapRef.current.setZoom(8);
      mapRef.current.setCenter(newLocation);
    }
    
    // Reverse geocode the clicked location
    reverseGeocode(newLocation);
  }, [reverseGeocode, infoWindow]);

  // Handle opening map modal
  const handleOpenMap = () => {
    setShowMapModal(true);
  };

  // Handle closing map modal
  const handleCloseMap = () => {
    setShowMapModal(false);
  };

  // If Google Maps is not loaded, show loading state
  if (!isLoaded) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60px' }}>
        <div className="spinner-border text-primary spinner-border-sm" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Check if Google Maps API key is available
  if (!GOOGLE_API_KEY) {
    return (
      <div className="alert alert-warning" role="alert">
        <strong>Google Maps API key is missing!</strong> Please add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file.
      </div>
    );
  }

  // Button-only mode (for use in forms, etc.)
  if (!showMap) {
    return (
      <div className="locate-me-button-only">
        <button
          type="button"
          className={`btn btn-outline-primary ${className}`}
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Getting Location...
            </>
          ) : (
            <>
              <i className="fas fa-location-arrow me-2"></i>
              {buttonText}
            </>
          )}
        </button>
        
        {selectedLocation && selectedLocation.lat && selectedLocation.lng && (
          <div className="mt-2">
            <small className="text-muted">
              <strong>Current Location:</strong> {address || 
                `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
            </small>
          </div>
        )}
        
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm mt-2"
          onClick={handleOpenMap}
        >
          <i className="fas fa-map me-1"></i>
          Open Map
        </button>

        {/* Map Modal */}
        {showMapModal && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Get Current Location</h5>
                  <button type="button" className="btn-close" onClick={handleCloseMap}></button>
                </div>
                <div className="modal-body">
                  <LocateMe 
                    onLocationSelect={onLocationSelect}
                    initialLocation={selectedLocation}
                    showMap={true}
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseMap}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full map mode
  return (
    <div className="locate-me-component">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="mb-1">Select Location</h6>
          <small className="text-muted">Search for a place, click on the map, drag the marker, or use your current location</small>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Getting Location...
            </>
          ) : (
            <>
              <i className="fas fa-location-arrow me-1"></i>
              {buttonText}
            </>
          )}
        </button>
      </div>

      {/* Place Search Input */}
      <div className="mb-3">
        {window.google && window.google.maps && window.google.maps.places ? (
          <Autocomplete
            onLoad={onAutocompleteLoad}
            onPlaceChanged={onPlaceChanged}
            options={{
              types: ['establishment', 'geocode'],
              componentRestrictions: { country: 'lk' }, // Restrict to Sri Lanka
            }}
          >
            <input
              type="text"
              className="form-control"
              placeholder="Search for a place..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </Autocomplete>
        ) : (
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search for a place... (Press Enter to search)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              style={{
                padding: '8px 12px',
                borderRadius: '4px 0 0 4px',
                border: '1px solid #ddd'
              }}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => handleManualSearch(searchQuery)}
              style={{
                borderRadius: '0 4px 4px 0',
                border: '1px solid #ddd',
                borderLeft: 'none'
              }}
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
        )}
      </div>

      {!isLoaded ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: mapHeight }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading Google Maps...</p>
          </div>
        </div>
      ) : (
        <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={selectedLocation}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          mapTypeId: 'roadmap',
          clickableIcons: true,
        }}
      >
        {/* Debug: Show what selectedLocation contains */}
        {console.log('RENDER: selectedLocation =', selectedLocation)}
        {console.log('RENDER: currentLocation =', currentLocation)}
        {console.log('RENDER: Google maps available =', !!window.google)}
        {console.log('RENDER: Red marker should render =', !!(selectedLocation && selectedLocation.lat && selectedLocation.lng))}
        {console.log('RENDER: hasSelectedLocation =', hasSelectedLocation)}
        
        {/* Blue marker for current location (GPS location) */}
        {currentLocation && currentLocation.lat && currentLocation.lng && (
          <Marker
            position={currentLocation}
            title="Current Location (GPS)"
            onLoad={(marker) => {
              console.log('Current Location Marker loaded:', marker);
              console.log('Current Location position:', marker.getPosition());
            }}
            options={{
              optimized: false,
              zIndex: 1000,
            }}
            icon={
              window.google?.maps ? {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new window.google.maps.Size(32, 32),
              } : undefined
            }
          />
        )}
        
        {/* Red marker for selected location (draggable) - only show when user has actually selected a location */}
        {hasSelectedLocation && selectedLocation && selectedLocation.lat && selectedLocation.lng && (
          <Marker
            position={selectedLocation}
            draggable={true}
            onDragEnd={onMarkerDragEnd}
            title="Selected Location - Drag to move"
            onLoad={(marker) => {
              console.log('Selected Location Marker loaded:', marker);
              console.log('Selected Location position:', marker.getPosition());
              console.log('Selected Location visible:', marker.getVisible());
            }}
            options={{
              animation: window.google?.maps?.Animation?.DROP,
              optimized: false,
              zIndex: 1001, // Higher z-index to ensure it's above the blue marker
              visible: true,
            }}
            icon={
              window.google?.maps ? {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new window.google.maps.Size(40, 40),
              } : undefined
            }
          />
        )}
      </GoogleMap>
      )}

      {/* Location Information Points */}
      <div className="mt-3">
        <div className="row">
          {/* Current Location - always show when available */}
          {currentLocation && currentLocation.lat && currentLocation.lng && (
            <div className="col-12 mb-2">
              <div className="p-2 bg-light rounded">
                <small className="text-muted">
                  <strong>Current Location:</strong> {currentLocationAddress || 
                    `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`}
                </small>
              </div>
            </div>
          )}
          
          {/* Selected Location - only show when user has selected a location */}
          {hasSelectedLocation && (
            <>
              <div className="col-12 mb-2">
                <div className="p-2 bg-light rounded">
                  <small className="text-muted">
                    <strong>Selected Location:</strong> {address || 'Location selected'}
                  </small>
                </div>
              </div>
              
              <div className="col-12 mb-2">
                <div className="p-2 bg-light rounded">
                  <small className="text-muted">
                    <strong>Coordinates:</strong> {selectedLocation && selectedLocation.lat && selectedLocation.lng 
                      ? `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
                      : 'No coordinates available'}
                  </small>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocateMe;