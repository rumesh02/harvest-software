import React from "react";
import { Grid, Container, Typography } from "@mui/material";
import Sidebar from "../components/Sidebar";
import HarvestCard from "../components/HarvestCard";

const vegetables = [
  { id: 1, name: "Tomato", image: "/images/tomato.jpg", price: 120, weight: 50 },
  { id: 2, name: "Carrot", image: "/images/carrot.jpg", price: 80, weight: 30 },
  { id: 3, name: "Cabbage", image: "/images/cabbage.jpg", price: 60, weight: 40 },
  { id: 4, name: "Potato", image: "/images/potato.jpg", price: 100, weight: 70 },
  { id: 5, name: "Beans", image: "/images/beans.jpg", price: 100, weight: 70 },
];

const ViewListedItems = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 5, ml: "-180px", flexGrow: 1 }}>
        
        {/* Page Title */}
        <Typography variant="h4" fontFamily={"Josephin Sans}"} fontWeight="bold" mb={3}>
          Listed Items
        </Typography>

        {/* Cards Grid */}
        <Grid container spacing={2}>
          {vegetables.map((veg) => (
            <Grid item key={veg.id} xs={12} sm={6} md={4} lg={3}>
              <HarvestCard image={veg.image} name={veg.name} price={veg.price} weight={veg.weight} />
            </Grid>
          ))}
        </Grid>

      </Container>
    </div>
  );
};

export default ViewListedItems;
