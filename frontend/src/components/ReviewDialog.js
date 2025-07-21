import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ReviewDialog({
  open,
  onClose,
  farmerId,
  merchantId,
  orderId,
  farmerRatings,
  product,
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      console.log("Submitting review:", { farmerId, merchantId, orderId, rating, comment });
      
      const response = await axios.post("http://localhost:5000/api/reviews", {
        farmerId,
        merchantId,
        orderId,
        rating,
        comment,
      });

      console.log("Review submitted successfully:", response.data);
      alert(`Review submitted successfully! Farmer's new average rating: ${response.data.avgRating?.toFixed(1) || 'N/A'}`);
      onClose(true);
    } catch (err) {
      console.error("Error submitting review:", err);
      let errorMessage = "Error submitting review. ";
      
      if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += "Please try again.";
      }
      
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`modal fade ${open ? "show d-block" : ""}`}
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-3">
          <div className="modal-header">
            <h5 className="modal-title">Leave a Review</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => onClose(false)}
            ></button>
          </div>

          <div className="modal-body">
            {/* User Input Rating */}
            <div className="text-center mb-2 mt-2">
              {Array.from({ length: 5 }, (_, i) => (
                <i
                  key={i}
                  className={`fas fa-star`}
                  style={{
                    fontSize: "35px",
                    marginTop: "10px",
                    color: (hover || rating) > i ? "#ffc107" : "#e4e5e9",
                    cursor: "pointer",
                    transition: "color 0.2s",
                  }}
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHover(i + 1)}
                  onMouseLeave={() => setHover(0)}
                ></i>
              ))}
            </div>

            {/* Comment */}
            <div className="mb-3">
              <label htmlFor="comment" className="form-label">
                Comment
              </label>
              <textarea
                className="form-control"
                id="comment"
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={() => onClose(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}