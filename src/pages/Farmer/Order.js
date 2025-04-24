import React, { useState, useEffect } from "react";
import axios from "axios";

const OrderPage = () => {
  const [orders, setOrders] = useState([]);

  // Fetch bids and convert them to orders
  useEffect(() => {
    const fetchBids = async () => {
      try {
        const farmerId = localStorage.getItem("user_id"); // Get logged-in farmer's ID
        const response = await axios.get(`http://localhost:5000/api/bids?farmerId=${farmerId}`);
        const bids = response.data;

        // Fetch merchant details for each bid
        const transformedOrders = await Promise.all(
          bids.map(async (bid) => {
            let merchantName = "Anonymous";
            let merchantPhone = "N/A";

            // Fetch merchant details from the backend
            if (bid.merchantId) {
              try {
                const merchantResponse = await axios.get(`http://localhost:5000/api/users/${bid.merchantId}`);
                const merchant = merchantResponse.data;
                merchantName = merchant.name || "Anonymous";
                merchantPhone = merchant.phone || "N/A";
              } catch (error) {
                console.error(`Error fetching merchant details for ID ${bid.merchantId}:`, error);
              }
            }

            // Transform bid to order format
            return {
              id: bid._id,
              harvest: bid.productName,
              price: `Rs. ${bid.bidAmount}`,
              weight: `${bid.orderWeight}kg`,
              buyer: merchantName, // Use fetched merchant name
              phone: merchantPhone, // Use fetched merchant phone
              status: getOrderStatus(bid.status),
              paymentStatus: getPaymentStatus(bid.status, bid.paymentStatus),
            };
          })
        );

        setOrders(transformedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchBids();
    // Refresh orders every 30 seconds
    const interval = setInterval(fetchBids, 30000);
    return () => clearInterval(interval);
  }, []);

  // Convert bid status to order status
  const getOrderStatus = (bidStatus) => {
    switch (bidStatus) {
      case "Accepted":
        return "Pending";
      case "Rejected":
        return "Reject";
      case "Completed":
        return "Done";
      default:
        return bidStatus;
    }
  };

  // Add new function to determine payment status
  const getPaymentStatus = (bidStatus, currentPaymentStatus) => {
    switch (bidStatus) {
      case "Rejected":
        return "Cancelled";
      case "Completed":
        return "Completed";
      case "Accepted":
        return "Pending";
      default:
        return currentPaymentStatus;
    }
  };

  // Handle order status changes
  const handleStatusChange = async (id, newStatus) => {
    try {
      // Convert order status back to bid status
      let bidStatus;
      switch (newStatus) {
        case "Done":
          bidStatus = "Completed";
          break;
        case "Reject":
          bidStatus = "Rejected";
          break;
        case "Pending":
          bidStatus = "Accepted";
          break;
        default:
          bidStatus = newStatus;
      }

      // Update bid status in backend
      await axios.put(`http://localhost:5000/api/bids/status/${id}`, {
        status: bidStatus,
      });

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === id ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  return (
    <div className="p-6 w-full overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-3 mt-3">Orders</h2>
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
              <th className="border p-2">Order fulfillment status</th>
              <th className="border p-2">Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.id} className="bg-white border text-sm md:text-base">
                <td className="border p-2 text-center">{index + 1}</td>
                <td className="border p-2 text-center">{order.harvest}</td>
                <td className="border p-2 text-center">{order.price}</td>
                <td className="border p-2 text-center">{order.weight}</td>
                <td className="border p-2 text-center">{order.buyer}</td>
                <td className="border p-2 text-center">{order.phone}</td>
                <td className="border p-2 text-center">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`border p-1 rounded ${
                      order.status === "Done"
                        ? "bg-green-100"
                        : order.status === "Pending"
                        ? "bg-yellow-100"
                        : order.status === "Reject"
                        ? "bg-red-100"
                        : ""
                    }`}
                  >
                    <option value="Done">Done</option>
                    <option value="Pending">Pending</option>
                    <option value="Reject">Reject</option>
                  </select>
                </td>
                <td className="border p-2 text-center">
                  <span
                    className={`px-2 py-1 rounded ${
                      order.status === "Reject"
                        ? "bg-red-100"
                        : order.paymentStatus === "Completed"
                        ? "bg-green-100"
                        : order.paymentStatus === "Pending"
                        ? "bg-yellow-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {order.status === "Reject"
                      ? "Cancelled"
                      : order.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderPage;
