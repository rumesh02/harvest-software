import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";

const MapWithRoute = ({ start, end }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with your actual API key
  });

  const [directions, setDirections] = useState(null);

  // Defensive check for coordinates
  const validCoords =
    start && end &&
    typeof start.lat === "number" && typeof start.lng === "number" &&
    typeof end.lat === "number" && typeof end.lng === "number";

  useEffect(() => {
    if (isLoaded && validCoords) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: start.lat, lng: start.lng },
          destination: { lat: end.lat, lng: end.lng },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error("Directions request failed:", status);
          }
        }
      );
    } else {
      setDirections(null);
    }
    // Optional cleanup
    return () => setDirections(null);
  }, [isLoaded, validCoords, start, end]);

  if (!isLoaded) return <div>Loading map...</div>;

  if (!validCoords) {
    return <div>Route map not available</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "200px" }}
      center={start}
      zoom={10}
    >
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
};

export default MapWithRoute;
