import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_API_KEY } from "../config";
import { GOOGLE_MAPS_LIBRARIES } from "../config/googleMaps";

// Static configuration to prevent reloading
const GOOGLE_MAPS_CONFIG = {
  googleMapsApiKey: GOOGLE_API_KEY,
  libraries: GOOGLE_MAPS_LIBRARIES,
};

function LocateMeMap(props) {
  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_CONFIG);

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [houseNo, setHouseNo] = useState("");
  const [streetName, setStreetName] = useState("");
  const [directions, setDirections] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);

 
  // Initialize map and marker whenever modal opens and location is set
  useEffect(() => {
    if (mapModalOpen && location && window.google && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 15,
      });

      const marker = new window.google.maps.Marker({
        position: location,
        map,
        draggable: true,
      });
      markerRef.current = marker;

      // When marker is dragged, update location & reverse geocode address
      marker.addListener("dragend", async (event) => {
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();
        setLocation({ lat: newLat, lng: newLng });

        // Reverse geocode for updated address
        try {
          const res = await fetch(
            `http://localhost:5000/api/geolocation/geocode?lat=${newLat}&lng=${newLng}`
          );
          const data = await res.json();
          if (res.ok) {
            setAddress(data.address);
          } else {
            console.warn("Reverse geocoding failed:", data);
            setAddress(`Location: ${newLat.toFixed(6)}, ${newLng.toFixed(6)}`);
          }
        } catch (err) {
          console.warn("Reverse geocoding error:", err);
          setAddress(`Location: ${newLat.toFixed(6)}, ${newLng.toFixed(6)}`);
        }
      });

      // Initialize autocomplete input
      if (autocompleteRef.current) {
        const autocomplete = new window.google.maps.places.Autocomplete(
          autocompleteRef.current,
          { fields: ["geometry", "formatted_address"] }
        );

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) {
            alert("No details available for input: '" + place.name + "'");
            return;
          }
          const newLoc = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setLocation(newLoc);
          setAddress(place.formatted_address);
          // Move marker and center map
          marker.setPosition(newLoc);
          map.setCenter(newLoc);
        });
      }
    }
  }, [mapModalOpen, location]);

  // Get user current location and open modal
  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng });

          try {
            const response = await fetch(
              `http://localhost:5000/api/geolocation/geocode?lat=${lat}&lng=${lng}`
            );
            const data = await response.json();

            if (response.ok) {
              setAddress(data.address);
            } else {
              console.warn("Geocoding failed:", data);
              setAddress("Unable to fetch address - using coordinates");
            }
          } catch (err) {
            console.warn("Geocoding error:", err);
            setAddress(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          }

          setMapModalOpen(true);
        },
        (err) => {
          console.error("Geolocation error:", err);
          alert("Error fetching location: " + err.message);
        }
      );
    } else {
      alert("Geolocation not supported");
    }
  };

  // Confirm button handler
  const handleConfirmLocation = () => {
    if (!houseNo || !streetName) {
      alert("Please fill both House Number and Street Name.");
      return;
    }
    // Pass location and address up to parent
    props.onLocationConfirm({
      lat: location.lat,
      lng: location.lng,
      address,
      houseNo,
      streetName,
    });
    setMapModalOpen(false);
  };

  useEffect(() => {
    if (
      isLoaded &&
      location &&
      props.endLocation &&
      typeof props.endLocation.lat === "number" &&
      typeof props.endLocation.lng === "number"
    ) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: location.lat, lng: location.lng },
          destination: { lat: props.endLocation.lat, lng: props.endLocation.lng },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          }
        }
      );
    } else {
      setDirections(null);
    }
  }, [isLoaded, location, props.endLocation]);

  // Remove console logs to reduce noise
  // console.log("isLoaded:", isLoaded);
  // console.log("location:", location);

  if (!isLoaded) return <div>Loading map...</div>;
  return (
    <div>
      <Button
        onClick={handleLocate}
        variant="contained"
        color="inherit"
        size="small"
        sx={{ borderRadius: 2 }}
      >
        <b>📍 Locate Me</b>
      </Button>

      <Dialog open={mapModalOpen} onClose={() => setMapModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ textAlign: "center", fontWeight: 700 }}>Your Location</DialogTitle>
        <DialogContent>
         

          {location && (
            <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
              {/* Map + Coordinates */}
              <Box sx={{ flex: 1 }}>
                <div
                  ref={mapRef}
                  style={{ width: "100%", height: "300px", marginBottom: "1rem" }}
                />
               
                <p>
                  <strong>Latitude:</strong> {location.lat}
                </p>
                <p>
                  <strong>Longitude:</strong> {location.lng}
                </p>
              </Box>

              {/* Form fields */}
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="House Number"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{ marginBottom: "1rem" }}
                />
                <TextField
                  label="Street Name"
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  fullWidth
                  variant="outlined"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMapModalOpen(false)} color="secondary" variant="outlined">
            Go Back
          </Button>
          <Button onClick={handleConfirmLocation} color="primary" variant="contained">
            Confirm & Continue
          </Button>
        </DialogActions>
      </Dialog>

      {directions && (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "200px" }}
          center={location}
          zoom={10}
        >
          <DirectionsRenderer directions={directions} />
        </GoogleMap>
      )}
    </div>
  );
}

export default LocateMeMap;
