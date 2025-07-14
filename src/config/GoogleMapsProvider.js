import React, { createContext, useContext } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { GOOGLE_API_KEY } from '../config';
import { GOOGLE_MAPS_LIBRARIES } from './googleMaps';

// Static configuration to prevent reloading
const GOOGLE_MAPS_CONFIG = {
  googleMapsApiKey: GOOGLE_API_KEY,
  libraries: GOOGLE_MAPS_LIBRARIES,
  // Add loading options for better performance
  preventGoogleFontsLoading: true,
};

const GoogleMapsContext = createContext({
  isLoaded: false,
  loadError: null,
});

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
};

export const GoogleMapsProvider = ({ children }) => {
  const { isLoaded, loadError } = useJsApiLoader(GOOGLE_MAPS_CONFIG);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};
