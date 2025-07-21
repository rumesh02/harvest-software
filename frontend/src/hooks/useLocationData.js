import { useState, useCallback } from 'react';

// Custom hook for managing location data
const useLocationData = (initialLocation = null) => {
  const [locationData, setLocationData] = useState({
    coordinates: initialLocation,
    address: '',
    timestamp: null,
    isLoading: false,
    error: null
  });

  const updateLocation = useCallback((newLocationData) => {
    setLocationData(prev => ({
      ...prev,
      ...newLocationData,
      timestamp: new Date()
    }));
  }, []);

  const setLoading = useCallback((isLoading) => {
    setLocationData(prev => ({
      ...prev,
      isLoading
    }));
  }, []);

  const setError = useCallback((error) => {
    setLocationData(prev => ({
      ...prev,
      error,
      isLoading: false
    }));
  }, []);

  const clearError = useCallback(() => {
    setLocationData(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  const resetLocation = useCallback(() => {
    setLocationData({
      coordinates: null,
      address: '',
      timestamp: null,
      isLoading: false,
      error: null
    });
  }, []);

  // Helper function to check if location data is valid
  const isValidLocation = useCallback(() => {
    return locationData.coordinates && 
           locationData.coordinates.lat && 
           locationData.coordinates.lng;
  }, [locationData.coordinates]);

  // Helper function to format location for API
  const getApiFormat = useCallback(() => {
    if (!isValidLocation()) return null;
    
    return {
      coordinates: locationData.coordinates,
      address: locationData.address,
      timestamp: locationData.timestamp
    };
  }, [locationData, isValidLocation]);

  return {
    locationData,
    updateLocation,
    setLoading,
    setError,
    clearError,
    resetLocation,
    isValidLocation,
    getApiFormat
  };
};

export default useLocationData;
