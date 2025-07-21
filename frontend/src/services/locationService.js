// Location service utilities
class LocationService {
  constructor() {
    this.geocoder = null;
    this.initializeGeocoder();
  }

  initializeGeocoder() {
    if (window.google && window.google.maps) {
      this.geocoder = new window.google.maps.Geocoder();
    }
  }

  // Get current position using browser geolocation
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let errorMessage = 'Unable to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'An unknown error occurred';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Convert coordinates to address
  async reverseGeocode(lat, lng) {
    return new Promise((resolve, reject) => {
      if (!this.geocoder) {
        this.initializeGeocoder();
      }

      if (!this.geocoder) {
        reject(new Error('Google Maps geocoder not available'));
        return;
      }

      this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          resolve({
            address: results[0].formatted_address,
            components: this.parseAddressComponents(results[0].address_components),
            placeId: results[0].place_id
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  // Convert address to coordinates
  async forwardGeocode(address) {
    return new Promise((resolve, reject) => {
      if (!this.geocoder) {
        this.initializeGeocoder();
      }

      if (!this.geocoder) {
        reject(new Error('Google Maps geocoder not available'));
        return;
      }

      this.geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const location = results[0].geometry.location;
          resolve({
            coordinates: {
              lat: location.lat(),
              lng: location.lng()
            },
            address: results[0].formatted_address,
            components: this.parseAddressComponents(results[0].address_components),
            placeId: results[0].place_id,
            bounds: results[0].geometry.bounds
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  // Parse address components for structured data
  parseAddressComponents(components) {
    const parsed = {};
    
    components.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        parsed.streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        parsed.street = component.long_name;
      }
      if (types.includes('locality')) {
        parsed.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        parsed.province = component.long_name;
      }
      if (types.includes('administrative_area_level_2')) {
        parsed.district = component.long_name;
      }
      if (types.includes('country')) {
        parsed.country = component.long_name;
        parsed.countryCode = component.short_name;
      }
      if (types.includes('postal_code')) {
        parsed.postalCode = component.long_name;
      }
    });

    return parsed;
  }

  // Calculate distance between two points (in kilometers)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Validate coordinates
  isValidCoordinates(lat, lng) {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  }

  // Format coordinates for display
  formatCoordinates(lat, lng, precision = 6) {
    if (!this.isValidCoordinates(lat, lng)) {
      return 'Invalid coordinates';
    }
    return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
  }

  // Get location bounds for a given center and radius (in kilometers)
  getBounds(centerLat, centerLng, radiusKm) {
    const latChange = radiusKm / 111.32; // 1 degree latitude ≈ 111.32 km
    const lngChange = radiusKm / (111.32 * Math.cos(centerLat * Math.PI / 180));

    return {
      north: centerLat + latChange,
      south: centerLat - latChange,
      east: centerLng + lngChange,
      west: centerLng - lngChange
    };
  }

  // Save location to user profile
  async saveLocationToProfile(userId, locationData) {
    try {
      const response = await fetch('/api/users/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          location: {
            coordinates: locationData.coordinates,
            address: locationData.address,
            lastUpdated: new Date()
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save location');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving location:', error);
      throw error;
    }
  }

  // Get saved location from user profile
  async getSavedLocation(userId) {
    try {
      const response = await fetch(`/api/users/${userId}/location`);
      
      if (!response.ok) {
        throw new Error('Failed to get saved location');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting saved location:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const locationService = new LocationService();
export default locationService;
