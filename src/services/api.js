import axios from 'axios';

// Get the token from localStorage
const getToken = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo).token : null;
};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Adjust the base URL according to your backend setup
const API_BASE_URL = 'http://localhost:5000/api';

export const addVehicle = async (vehicleData) => {
  const formData = new FormData();
  formData.append('vehicleType', vehicleData.vehicleType);
  formData.append('licensePlate', vehicleData.licensePlate);
  formData.append('loadCapacity', vehicleData.loadCapacity);
  formData.append('pricePerKm', vehicleData.pricePerKm);
  formData.append('transporterId', vehicleData.transporterId);
  formData.append('district', vehicleData.district);
  if (vehicleData.file) {
    formData.append('vehicleImage', vehicleData.file);
  }

  try {
    const response = await axios.post('http://localhost:5000/api/vehicles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getVehicles = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicles`);
    return response.data;
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error;
  }
};

export const updateVehicle = async (id, vehicleData) => {
  const formData = new FormData();
  formData.append('vehicleType', vehicleData.vehicleType);
  formData.append('licensePlate', vehicleData.licensePlate);
  formData.append('loadCapacity', vehicleData.loadCapacity);
  formData.append('pricePerKm', vehicleData.pricePerKm);
  formData.append("transporterAuth0Id", vehicleData.transporterAuth0Id);
  if (vehicleData.file) {
    formData.append('vehicleImage', vehicleData.file);
  }
  try {
    const response = await axios.put(
      `http://localhost:5000/api/vehicles/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteVehicle = async (id) => {
  try {
    const response = await axios.delete(`http://localhost:5000/api/vehicles/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBookingsForTransporter = async (transporterId) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/bookings/transporter/${transporterId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createBooking = async (bookingData) => {
  const response = await axios.post('http://localhost:5000/api/bookings', bookingData);
  return response.data;
};

export default api;