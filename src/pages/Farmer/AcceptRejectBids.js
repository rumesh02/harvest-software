import React from "react";

const AcceptRejectBids = () => {
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
            {[ 
              { id: 1, harvest: "Carrot", price: "Rs. 270", weight: "150kg", buyer: "Nimal Perera", phone: "077 325 8144" },
              { id: 2, harvest: "Mango", price: "Rs. 350", weight: "90kg", buyer: "Ajith Silva", phone: "077 089 2564" },
              { id: 3, harvest: "Onion", price: "Rs. 105", weight: "800kg", buyer: "Hemal Costa", phone: "077 200 6933" },
              { id: 4, harvest: "Carrot", price: "Rs. 260", weight: "200kg", buyer: "Sunil Shantha", phone: "077 552 0014" }
            ].map((bid) => (
              <tr key={bid.id} className="bg-white border text-sm md:text-base">
                <td className="border p-2 text-center">{bid.id}</td>
                <td className="border p-2 text-center">{bid.harvest}</td>
                <td className="border p-2 text-center">{bid.price}</td>
                <td className="border p-2 text-center">{bid.weight}</td>
                <td className="border p-2 text-center">{bid.buyer}</td>
                <td className="border p-2 text-center">{bid.phone}</td>
                <td className="border p-2 flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-2">
                  <button className="accept-btn"> Accept</button>
                  <button className="accept-btn"> Reject</button>
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
