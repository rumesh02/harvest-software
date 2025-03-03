import React from "react";
import { Button } from "@mui/material";

const PaymentApprove = () => {
  const payments = [
    {
      id: 1,
      harvest: "Carrot",
      billTotal: "Rs. 27,000",
      method: "Online",
      buyer: "Nimal Perera",
      date: "2025/01/06",
    },
    {
      id: 2,
      harvest: "Onion",
      billTotal: "Rs. 126,500",
      method: "Transfer",
      buyer: "Nimal Perera",
      date: "2025/01/21",
    },
  ];

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-semibold mb-4 mt-4">Payment Approve</h2>
      <div className="bg-white p-4 rounded-lg shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3">No.</th>
              <th className="p-3">Harvest</th>
              <th className="p-3">Bill Total</th>
              <th className="p-3">Method</th>
              <th className="p-3">Buyer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr key={payment.id} className="border-b">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{payment.harvest}</td>
                <td className="p-3">{payment.billTotal}</td>
                <td className="p-3">{payment.method}</td>
                <td className="p-3">{payment.buyer}</td>
                <td className="p-3">{payment.date}</td>
                <td className="p-3 flex gap-2">
                  <Button className="bg-green-500 hover:bg-green-600 text-red-500">✔ Paid</Button>
                  <Button className="bg-red-500 hover:bg-red-600 text-green-500">✖ Cancel</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentApprove;
