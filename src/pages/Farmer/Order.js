import React, { useState } from "react";

const OrderPage = () => {
  const [orders, setOrders] = useState([
    { id: 1, harvest: "Carrot", price: "Rs. 270", weight: "150kg", buyer: "Nimal Perera", phone: "077 325 8144", status: "Pending" },
    { id: 2, harvest: "Mango", price: "Rs. 350", weight: "90kg", buyer: "Ajith Silva", phone: "077 089 2564", status: "Pending" },
    { id: 3, harvest: "Onion", price: "Rs. 105", weight: "800kg", buyer: "Hemal Costa", phone: "077 200 6933", status: "Pending" },
    { id: 4, harvest: "Carrot", price: "Rs. 260", weight: "200kg", buyer: "Sunil Shantha", phone: "077 552 0014", status: "Pending" },
  ]);

  const handleStatusChange = (id, newStatus) => {
    setOrders(orders.map(order => order.id === id ? { ...order, status: newStatus } : order));
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
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="bg-white border text-sm md:text-base">
                <td className="border p-2 text-center">{order.id}</td>
                <td className="border p-2 text-center">{order.harvest}</td>
                <td className="border p-2 text-center">{order.price}</td>
                <td className="border p-2 text-center">{order.weight}</td>
                <td className="border p-2 text-center">{order.buyer}</td>
                <td className="border p-2 text-center">{order.phone}</td>
                <td className="border p-2 text-center">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="border p-1 rounded"
                  >
                    <option value="Done">Done</option>
                    <option value="Pending">Pending</option>
                    <option value="Reject">Reject</option>
                  </select>
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
