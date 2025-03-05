import React from "react";
import "./EditListed.css"; // Import CSS file
import lorryImage from "../../assets/lorry.jpg"; // Import lorry image
import lorryImage2 from "../../assets/lorry2.jpeg"; // Import lorry2 image
import lorryImage3 from "../../assets/lorry3.jpg"; // Import lorry3 image

export default function EditListed() {
  // Lorry data with unique images
  const lorries = [
    { id: 1, image: lorryImage, type: "Lorry" },
    { id: 2, image: lorryImage2, type: "Lorry" },
    { id: 3, image: lorryImage3, type: "Lorry" },
  ];

  const handleEdit = (id) => {
    console.log(`Editing lorry with id: ${id}`);
  };

  return (
    <div className="container">
      <h1 className="title">Edit Listed</h1>

      <div className="grid-container">
        {lorries.map((lorry) => (
          <div key={lorry.id} className="card">
            <div className="image-container">
              <img src={lorry.image} alt={lorry.type} className="lorry-image" />
            </div>

            <hr className="divider" />

            <p className="lorry-type">{lorry.type}</p>

            <button className="edit-button" onClick={() => handleEdit(lorry.id)}>
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
