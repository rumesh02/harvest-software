import React, { useEffect, useRef, useState } from "react";

const GOOGLE_API_KEY = "YOUR_API_KEY"; // Replace this

function LocateMeMap() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const mapRef = useRef(null);

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng });

          // Get Address using Geocoding API
          const response = await fetch(
            'https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${AIzaSyDoLmPyV3Rg_6NhdJyFEsXPggTeeQj0m-k}'
          );
          const data = await response.json();
          if (data.status === "OK") {
            setAddress(data.results[0].formatted_address);
          } else {
            setAddress("Unable to get address");
          }

          // Show map
          if (window.google) {
            const map = new window.google.maps.Map(mapRef.current, {
              center: { lat, lng },
              zoom: 15,
            });
            new window.google.maps.Marker({
              position: { lat, lng },
              map,
              title: "You are here",
            });
          }
        },
        (error) => {
          alert("Error getting location: " + error.message);
        }
      );
    } else {
      alert("Geolocation not supported by your browser.");
    }
  };

  return (
    <div>
      <button onClick={handleLocate}>📍 Locate Me</button>

      {location && (
        <div style={{ marginTop: "20px" }}>
          <div
            ref={mapRef}
            style={{ width: "100%", height: "300px", marginBottom: "10px" }}
          ></div>
          <p><strong>Latitude:</strong> {location.lat}</p>
          <p><strong>Longitude:</strong> {location.lng}</p>
          <p><strong>Address:</strong> {address}</p>
        </div>
      )}
    </div>
  );
}

export default LocateMeMap;