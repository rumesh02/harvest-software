import React, { useState, useEffect } from "react";
import axios from "axios";

const BookVehicle = () => {
  const [district, setDistrict] = useState(""); // Merchant's district
  const [vehicleTypes, setVehicleTypes] = useState([]); // List of vehicle types
  const [selectedVehicleType, setSelectedVehicleType] = useState(""); // Selected vehicle type
  const [transporters, setTransporters] = useState([]); // List of transporters
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state

  useEffect(() => {
    // Fetch the merchant's district from localStorage or API
    const fetchMerchantDistrict = async () => {
      try {
        const merchantDistrict = localStorage.getItem("merchantDistrict");
        if (merchantDistrict) {
          setDistrict(merchantDistrict);
        } else {
          const response = await axios.get("http://localhost:5000/api/merchant/district");
          setDistrict(response.data.district);
        }
      } catch (err) {
        console.error("Error fetching merchant district:", err);
        setError("Failed to fetch merchant district.");
      }
    };

    // Fetch vehicle types
    const fetchVehicleTypes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/vehicles/vehicle-types");
        setVehicleTypes(response.data);
      } catch (err) {
        console.error("Error fetching vehicle types:", err);
        setError("Failed to fetch vehicle types.");
      }
    };

    fetchMerchantDistrict();
    fetchVehicleTypes();
  }, []);

  const searchTransporters = async () => {
    setLoading(true);
    setError("");
    try {
      const queryParams = {
        district: district,
      };
      if (selectedVehicleType) {
        queryParams.vehicleType = selectedVehicleType;
      }

      const queryString = new URLSearchParams(queryParams).toString();
      const response = await axios.get(`http://localhost:5000/api/transporters?${queryString}`);
      setTransporters(response.data);
    } catch (err) {
      console.error("Error fetching transporters:", err);
      setError("Failed to fetch transporters.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Book a Vehicle</h1>
      <p>Search for transporters in your district: <strong>{district}</strong></p>

      {/* Vehicle type dropdown */}
      <div className="my-4">
        <label className="block mb-2">Select Vehicle Type (optional):</label>
        <select
          className="border p-2 rounded"
          value={selectedVehicleType}
          onChange={(e) => setSelectedVehicleType(e.target.value)}
        >
          <option value="">All Vehicle Types</option>
          {vehicleTypes.map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={searchTransporters}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {loading ? "Searching..." : "Search Transporters"}
      </button>

      {error && <p style={{ color: "red" }} className="mt-4">{error}</p>}

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Available Transporters</h2>
        {transporters.length === 0 && !loading && <p>No transporters found.</p>}
        <ul className="space-y-4">
          {transporters.map((transporter) => (
            <li key={transporter.id} className="border p-4 rounded shadow">
              <p><strong>Name:</strong> {transporter.name}</p>
              <p><strong>Contact:</strong> {transporter.contact}</p>
              <p><strong>Vehicle Type:</strong> {transporter.vehicleType}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BookVehicle;
