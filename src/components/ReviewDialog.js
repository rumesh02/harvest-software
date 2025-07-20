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
    setSubmitting(true);
    try {
      await axios.post("http://localhost:5000/api/reviews", {
        farmerId,
        merchantId,
        orderId,
        rating,
        comment,
      });
      onClose(true);
    } catch (err) {
      alert("Error submitting review");
    }
    setSubmitting(false);
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
            {/* Average Rating */}
            {product && (
              <div className="d-flex align-items-center mb-3">
                <div style={{ fontSize: "48px", color: "#fbc02d" }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star ${
                        i < (farmerRatings[product.farmerID] || 0)
                          ? ""
                          : "text-muted"
                      }`}
                    ></i>
                  ))}
                </div>
                <span className="ms-2 text-muted">
                  {farmerRatings[product.farmerID]
                    ? `${farmerRatings[product.farmerID].toFixed(1)} / 5`
                    : "No ratings"}
                </span>
              </div>
            )}

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