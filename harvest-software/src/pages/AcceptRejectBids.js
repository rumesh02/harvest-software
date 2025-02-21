import React from "react";

const AcceptRejectBids = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 mt-5">Accept / Reject Bids</h2>
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
          {[
            { id: 1, harvest: "Carrot", price: "Rs. 270", weight: "150kg", buyer: "Nimal Perera", phone: "077 325 8144" },
            { id: 2, harvest: "Mango", price: "Rs. 350", weight: "90kg", buyer: "Ajith Silva", phone: "077 089 2564" },
            { id: 3, harvest: "Onion", price: "Rs. 105", weight: "800kg", buyer: "Hemal Costa", phone: "077 200 6933" },
            { id: 4, harvest: "Carrot", price: "Rs. 260", weight: "200kg", buyer: "Sunil Shantha", phone: "077 552 0014" }
          ].map((bid) => (
            <tr key={bid.id} className="bg-white border">
              <td className="border p-2">{bid.id}</td>
              <td className="border p-2">{bid.harvest}</td>
              <td className="border p-2">{bid.price}</td>
              <td className="border p-2">{bid.weight}</td>
              <td className="border p-2">{bid.buyer}</td>
              <td className="border p-2">{bid.phone}</td>
              <td className="border p-2 flex space-x-2">
                <button className="bg-green-500 text-black px-4 py-1 rounded hover:bg-green-600 transition">✅ Accept</button>
                <button className="bg-red-500 text-black px-4 py-1 rounded hover:bg-red-600 transition">❌ Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AcceptRejectBids;
