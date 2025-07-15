import { GOOGLE_API_KEY } from '../config';

// Google Maps configuration
// Keep libraries as a static array to prevent unnecessary reloads
// This array should be defined outside of any component to prevent re-initialization
const GOOGLE_MAPS_LIBRARIES = ['places'];

// Centralized Google Maps configuration to prevent loader conflicts
export const GOOGLE_MAPS_CONFIG = {
  googleMapsApiKey: GOOGLE_API_KEY,
  libraries: GOOGLE_MAPS_LIBRARIES,
  // Remove conflicting options that might cause loader issues
  // region: 'LK', // Remove region to avoid conflicts
  // language: 'en',
  // preventGoogleFontsLoading: true,
};

export { GOOGLE_MAPS_LIBRARIES };

// Default map center (Colombo, Sri Lanka)
export const DEFAULT_MAP_CENTER = {
  lat: 6.9271,
  lng: 79.8612
};

// Common map styles
export const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '400px'
};

export const SMALL_MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '200px'
};
