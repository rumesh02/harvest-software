import React, { useState } from "react";
import "./PaymentApprove.css";

const PaymentApproves = () => {
    const [payments, setPayments] = useState([
        { id: 1, name: "Rohan Silva", amount: 2500, status: "pending" },
        { id: 2, name: "Kamal Perera", amount: 4000, status: "pending" },
        { id: 3, name: "Saman Fernando", amount: 3200, status: "pending" },
    ]);

    const handleAction = (id, action) => {
        setPayments((prevPayments) =>
            prevPayments.map((payment) =>
                payment.id === id ? { ...payment, status: action } : payment
            )
        );
    };

    return (
        <div className="PaymentApprove-container">
            <h2 className="PaymentApprove-title">Payment Approvals</h2>


            <div className="payment-list">
                {payments.map((payment) => (
                    <div key={payment.id} className={`payment-card ${payment.status}`}>
                        <p><strong>{payment.name}</strong></p>
                        <p>Amount: Rs. {payment.amount}</p>
                        <div className="payment-actions">
                            {payment.status === "pending" ? (
                                <>
                                    <button className="approve-btn" onClick={() => handleAction(payment.id, "approved")}>Approve</button>
                                    <button className="reject-btn" onClick={() => handleAction(payment.id, "rejected")}>Reject</button>
                                </>
                            ) : (
                                <p className={payment.status}>{payment.status.toUpperCase()}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PaymentApproves;
