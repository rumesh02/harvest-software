import React from 'react';

const ListedItems = () => {
  // Sample produce data
  const produceItems = [
    {
      id: 1,
      name: 'Cabbage',
      price: 160,
      weight: 300,
      image: './images/cabbage.jpg'
    },
    {
      id: 2,
      name: 'Carrot',
      price: 220,
      weight: 470,
      image: './images/carrot.jpg'
    },
    {
      id: 3,
      name: 'Long Beans',
      price: 150,
      weight: 200,
      image: './images/beans.jpg'
    },
    {
      id: 4,
      name: 'Onion',
      price: 95,
      weight: 1120,
      image: './images/onions.jpg'
    },
    {
      id: 5,
      name: 'Potato',
      price: 90,
      weight: 1450,
      image: './images/potato.jpg'
    },
    {
      id: 6,
      name: 'Leeks',
      price: 160,
      weight: 470,
      image: './images/springonions.jpg'
    },
    {
      id: 7,
      name: 'Pineapple',
      price: 210,
      weight: 350,
      image: './images/pineapples.webp'
    },
    {
      id: 8,
      name: 'Mango',
      price: 320,
      weight: 90,
      image: './images/mangoes.jpg'
    }
  ];

  return (
    <div className="containerCards">
    <div className="p-1">
      <h2 className="mb-4">Listed Items</h2>
      
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        {produceItems.map(item => (
          <div key={item.id} className="col">
            <div className="mb-2">
              <img 
                src={item.image} 
                className="img-fluid rounded w-100"
                alt={item.name}
                style={{ height: "200px", objectFit: "cover" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                }}
              />
            </div>
            <div className="bg-light rounded p-3 text-center">
              <h5 className="mb-3">{item.name}</h5>
              <div className="d-flex justify-content-between">
                <span>Rs.{item.price}/kg</span>
                <span>{item.weight}kg</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default ListedItems;