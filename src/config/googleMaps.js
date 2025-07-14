// Google Maps configuration
// Keep libraries as a static array to prevent unnecessary reloads
export const GOOGLE_MAPS_LIBRARIES = ['places'];

export const GOOGLE_MAPS_CONFIG = {
  // Add loading optimization
  loadingStrategy: 'async',
  // Add other common options
  region: 'LK', // Sri Lanka
  language: 'en',
};

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
