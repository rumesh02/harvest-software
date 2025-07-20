import React, { createContext, useContext, useMemo } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { GOOGLE_MAPS_CONFIG } from './googleMaps';

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
  // Memoize the config to prevent re-initialization
  const config = useMemo(() => GOOGLE_MAPS_CONFIG, []);
  
  const { isLoaded, loadError } = useJsApiLoader(config);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};
