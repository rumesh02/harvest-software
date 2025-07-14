import React, { useState, useEffect } from "react";
import axios from "axios";

const AcceptRejectBids = () => {
  const [pendingBids, setPendingBids] = useState([]);

  useEffect(() => {
    fetchPendingBids();
  }, []);

  const fetchPendingBids = async () => {
    try {
      const farmerId = localStorage.getItem("user_id"); // Get logged-in farmer's ID
      const response = await axios.get(`http://localhost:5000/api/bids?farmerId=${farmerId}`);
      const pending = response.data.filter(bid => bid.status === "Pending");
      setPendingBids(pending);
    } catch (error) {
      console.error("Error fetching pending bids:", error);
    }
  };

  const handleBidAction = async (bidId, action) => {
    try {
      console.log(`Attempting to ${action} bid with ID:`, bidId);
      
      if (!bidId) {
        throw new Error("Bid ID is missing");
      }

      const endpoint = `http://localhost:5000/api/bids/${action.toLowerCase()}/${bidId}`;
      console.log("Calling endpoint:", endpoint);

      const response = await axios.put(endpoint);
      console.log("Server response:", response.data);

      if (response.data) {
        alert(`Bid ${action.toLowerCase()}ed successfully!`);
        await fetchPendingBids(); // Refresh the list
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing bid:`, error);
      let errorMessage = `Failed to ${action.toLowerCase()} bid. `;
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="p-6 w-full overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-3 mt-3">Accept / Reject Bids</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">No.</th>
              <th className="border p-2">Harvest</th>
              <th className="border p-2">Bid Price</th>
              <th className="border p-2">Weight</th>
              <th className="border p-2">Buyer</th>
              <th className="border p-2">Mobile No.</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingBids.map((bid, index) => (
              <tr key={bid._id} className="bg-white border text-sm md:text-base">
                <td className="border p-2 text-center">{index + 1}</td>
                <td className="border p-2 text-center">{bid.productName}</td>
                <td className="border p-2 text-center">Rs. {bid.bidAmount}</td>
                <td className="border p-2 text-center">{bid.orderWeight} kg</td>
                <td className="border p-2 text-center">{bid.merchantName || "Anonymous"}</td>
                <td className="border p-2 text-center">{bid.merchantPhone || "N/A"}</td>
                <td className="border p-2 flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-2">
                  <button 
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() => handleBidAction(bid._id, "Accept")}
                  >
                    Accept
                  </button>
                  <button 
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    onClick={() => handleBidAction(bid._id, "Reject")}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AcceptRejectBids;
