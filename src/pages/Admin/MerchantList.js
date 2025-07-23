import React, { useEffect, useState } from "react";
import axios from "axios";

const MerchantList = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/admin/users/merchant");
      setMerchants(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching merchants:', err);
      setError('Failed to fetch merchants data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
      setMerchants(merchants.filter(m => m._id !== id));
    }
  };

  useEffect(() => { fetchMerchants(); }, []);

  return (
    <div style={{ padding: 32 }}>
      <h2>Merchants</h2>
      {loading && <div>Loading merchants...</div>}
      {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}
      {!loading && !error && (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {merchants.map(m => (
              <tr key={m._id}>
                <td>{m.name}</td>
                <td>{m.email}</td>
                <td>{m.phone || "-"}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m._id)}>
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

export default MerchantList;