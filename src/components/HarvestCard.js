// components/HarvestCard.js
import React from "react";
import { Card, CardContent, CardMedia, Typography, Button, Box } from "@mui/material";

const HarvestCard = ({ image, name, price, weight, onEdit, onRemove }) => {
  return (
    <Card
      sx={{
        maxWidth: 300,
        borderRadius: 2,
        boxShadow: 3,
        m: 2,
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: 5,
        },
      }}
    >
      <CardMedia
        component="img"
        height="180"
        image={image}
        alt={name}
        sx={{ objectFit: "cover" }}
      />
      <CardContent>
        <Typography variant="h6" fontWeight="bold">
          {name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Price: Rs. {price} per kg
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Available: {weight} kg
        </Typography>

        {/* Edit and Remove Buttons in One Line with Green Colors */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button
            variant="contained"
            sx={{ bgcolor: "#4CAF50", "&:hover": { bgcolor: "#388E3C" }, flex: 1, mr: 1 }} // Light Green Edit Button
            onClick={() => onEdit(name)}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "#4CAF50", "&:hover": { bgcolor: "#388E3C" }, flex: 1 }} // Dark Green Remove Button
            onClick={() => onRemove(name)}
          >
            Remove
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HarvestCard;
