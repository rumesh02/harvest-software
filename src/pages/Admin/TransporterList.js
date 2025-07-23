import React, { useEffect, useState } from "react";
import axios from "axios";

const TransporterList = () => {
  const [transporters, setTransporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransporters = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/admin/users/transporter");
      setTransporters(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching transporters:', err);
      setError('Failed to fetch transporters data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
      setTransporters(transporters.filter(t => t._id !== id));
    }
  };

  useEffect(() => { fetchTransporters(); }, []);

  return (
    <div style={{ padding: 32 }}>
      <h2>Transporters</h2>
      {loading && <div>Loading transporters...</div>}
      {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}
      {!loading && !error && (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transporters.map(t => (
              <tr key={t._id}>
                <td>{t.name}</td>
                <td>{t.email}</td>
                <td>{t.phone || "-"}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}>
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

export default TransporterList;