import React, { useEffect, useState } from "react";
import axios from "axios";

const MerchantList = () => {
  const [merchants, setMerchants] = useState([]);

  const fetchMerchants = async () => {
    const res = await axios.get("/api/admin/users/merchant");
    setMerchants(res.data);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await axios.delete(`/api/admin/users/${id}`);
      setMerchants(merchants.filter(m => m._id !== id));
    }
  };

  useEffect(() => { fetchMerchants(); }, []);

  return (
    <div style={{ padding: 32 }}>
      <h2>Merchants</h2>
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
    </div>
  );
};

export default MerchantList;