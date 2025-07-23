import React, { useEffect, useState } from "react";
import axios from "axios";

const FarmerList = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/admin/users/farmer");
      setFarmers(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching farmers:', err);
      setError('Failed to fetch farmers data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
      setFarmers(farmers.filter(f => f._id !== id));
    }
  };

  useEffect(() => { fetchFarmers(); }, []);

  return (
    <div style={{ padding: 32 }}>
      <h2>Farmers</h2>
      {loading && <div>Loading farmers...</div>}
      {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}
      {!loading && !error && (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {farmers.map(f => (
              <tr key={f._id}>
                <td>{f.name}</td>
                <td>{f.email}</td>
                <td>{f.phone || "-"}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(f._id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FarmerList;